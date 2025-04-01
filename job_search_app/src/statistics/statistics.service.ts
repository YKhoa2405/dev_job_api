import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import { Model } from 'mongoose';
import { Application } from 'src/applications/schemas/application.schema';
import { Candidate } from 'src/candidates/schemas/candidate.schema';
import { Company } from 'src/companies/schemas/company.schema';
import { Job } from 'src/jobs/schemas/job.schema';
import { Order } from 'src/orders/schemas/order.schema';
import { Skill } from 'src/skills/schemas/skill.schema';

@Injectable()
export class StatisticsService {
    constructor(
        @InjectModel(Application.name) private applicationModel: Model<Application>,
        @InjectModel(Job.name) private jobModel: Model<Job>,
        @InjectModel(Candidate.name) private candidateModel: Model<Candidate>,
        @InjectModel(Skill.name) private skillModel: Model<Skill>,
        @InjectModel(Company.name) private companyModel: Model<Company>,
        @InjectModel(Order.name) private orderModel: Model<Order>
    ) { }

    // Company

    async getApplicationsPerJob(qr: string) {
        const { filter, sort } = aqp(qr);


        // Lấy danh sách job của công ty
        const jobs = await this.jobModel
            .find({ companyId: filter.companyId }) // Lọc job theo companyId
            .select('name') // Chỉ lấy trường name
            .sort({ createdAt: -1 }) // Sắp xếp theo createdAt giảm dần nếu không có sort
            .lean() // Chuyển thành plain JavaScript object
            .exec();

        // Nếu không có job nào, trả về mảng rỗng
        if (!jobs.length) {
            return [];
        }

        // Lấy danh sách job IDs
        const jobIds = jobs.map(job => job._id);

        // Đếm số lượng đơn ứng tuyển cho từng job
        const applicationCounts = await this.applicationModel
            .aggregate([
                {
                    $match: {
                        jobId: { $in: jobIds }, // Chỉ lấy các đơn ứng tuyển thuộc các job trong danh sách
                        companyId: filter.companyId, // Lọc theo companyId trong applications
                        isDeleted: false, // Không lấy bản ghi đã xóa
                    },
                },
                {
                    $group: {
                        _id: '$jobId', // Nhóm theo jobId
                        applicationCount: { $sum: 1 }, // Đếm số lượng đơn ứng tuyển
                    },
                },
            ])
            .exec();

        // Kết hợp dữ liệu jobs với applicationCount
        const result = jobs.map(job => {
            const countData = applicationCounts.find(count => count._id.toString() === job._id.toString());
            return {
                jobName: job.name, // Tên job
                applicationCount: countData ? countData.applicationCount : 0, // Số lượng đơn ứng tuyển
            };
        });

        return result;
    }

    async getExpectedSalary(qr: string) {
        const { filter } = aqp(qr);

        // Điều kiện mặc định: không lấy bản ghi đã xóa
        filter.isDeleted = false;
        delete filter.companyId


        // Đếm tổng số ứng viên phù hợp với bộ lọc
        const totalCandidates = await this.candidateModel.countDocuments(filter).exec();

        // Đếm số lượng ứng viên theo từng mức lương
        const result = await this.candidateModel
            .aggregate([
                { $match: filter }, // Áp dụng bộ lọc
                {
                    $group: {
                        _id: '$salary', // Nhóm theo giá trị salary
                        count: { $sum: 1 }, // Đếm số lượng
                    },
                },
                {
                    $project: {
                        title: '$_id', // Đổi _id thành title
                        count: 1,
                        _id: 0,
                    },
                },
            ])
            .exec();

        // Danh sách các mức lương cố định
        const salaryRanges = [
            'Dưới 5 triệu',
            '10 - 15 triệu',
            '15 - 20 triệu',
            '20 - 25 triệu',
            '30 - 50 triệu',
            'Trên 50 triệu',
            'Thỏa thuận',
        ];

        // Ghép kết quả với danh sách mức lương và tính phần trăm
        const formattedResult = salaryRanges.map(range => {
            const found = result.find(item => item.title === range);
            const count = found ? found.count : 0;
            const percentage = totalCandidates > 0 ? (count / totalCandidates) * 100 : 0;
            return {
                title: range,
                percentage: Number(percentage.toFixed(2)), // Làm tròn 2 chữ số thập phân
            };
        });

        return formattedResult;
    }

    async getApplicationStatus(qr: string) {
        const { filter } = aqp(qr);

        // Lọc theo thời gian nếu có
        if (filter.startDate && filter.endDate) {
            filter.createdAt = {
                $gte: new Date(filter.startDate),
                $lte: new Date(filter.endDate),
            };
        }

        // Lọc theo companyId nếu có (qua job.company)
        if (filter.companyId) {
            filter.companyId;
            delete filter.companyId;
        }

        // Đếm số lượng đơn ứng tuyển theo trạng thái
        const result = await this.applicationModel
            .aggregate([
                { $match: filter }, // Áp dụng bộ lọc
                {
                    $group: {
                        _id: '$status', // Nhóm theo trạng thái
                        count: { $sum: 1 }, // Đếm số lượng
                    },
                },
                {
                    $project: {
                        status: '$_id',
                        count: 1,
                        _id: 0,
                    },
                },
            ])
            .exec();

        // Danh sách trạng thái cố định
        const statuses = ['Chờ xử lý', 'Đã xem', 'Chấp nhận', 'Từ chối'];

        // Ghép kết quả với danh sách trạng thái để đảm bảo tất cả đều được trả về
        const formattedResult = statuses.map(status => {
            const found = result.find(item => item.status === status);
            return {
                status,
                count: found ? found.count : 0, // Nếu không có, count = 0
            };
        });

        return formattedResult;
    }

    async getCandidateSkills(qr: string) {
        const { filter } = aqp(qr);

        // Điều kiện mặc định: không lấy bản ghi đã xóa
        filter.isDeleted = false;
        delete filter.companyId

        // Lọc theo thời gian nếu có
        if (filter.startDate && filter.endDate) {
            const start = new Date(filter.startDate);
            const end = new Date(filter.endDate);
            filter.createdAt = {
                $gte: start,
                $lte: end,
            };
        }

        // Aggregation để đếm kỹ năng từ candidateModel
        const result = await this.candidateModel
            .aggregate([
                { $match: filter }, // Lọc candidates theo thời gian (nếu có)
                { $unwind: '$skills' }, // Giải nén mảng skills
                {
                    $group: {
                        _id: '$skills', // Nhóm theo kỹ năng
                        count: { $sum: 1 }, // Đếm số lượng
                    },
                },
                {
                    $project: {
                        skill: '$_id',
                        count: 1,
                        _id: 0,
                    },
                },
                { $sort: { count: -1 } }, // Sắp xếp theo mức độ phổ biến (giảm dần)
            ])
            .exec();

        return result;
    }

    async getOverViewAdmin(qr: string) {
        const { filter } = aqp(qr);
        const timeRange = filter.timeRange || '24h'; // Mặc định 24 giờ
        let timeFilter = {};
        switch (timeRange) {
            case '24h':
                timeFilter = { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) };
                break;
            case '7d':
                timeFilter = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
                break;
            case '30d':
                timeFilter = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
                break;
            default:
                timeFilter = {};
        }

        const totalCandidates = await this.candidateModel.countDocuments();
        const newCandidates = await this.candidateModel.countDocuments({
            createdAt: timeFilter,
        });

        const totalCompanies = await this.companyModel.countDocuments();
        const newCompanies = await this.companyModel.countDocuments({
            createdAt: timeFilter,
        });
        const pendingCompanies = await this.companyModel.countDocuments({
            isApproved: false,
        });

        const totalJobPostings = await this.jobModel.countDocuments();
        const newJobPostings = await this.jobModel.countDocuments({
            createdAt: timeFilter,
        });

        const revenueResult = await this.orderModel
            .aggregate([
                { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
            ])
            .exec();
        const revenue = revenueResult.length > 0 ? `${revenueResult[0].totalAmount.toLocaleString()}` : '0';

        const revenueIncreaseResult = await this.orderModel
            .aggregate([
                { $match: { createdAt: timeFilter } },
                { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
            ])
            .exec();
        const revenueIncrease =
            revenueIncreaseResult.length > 0
                ? `+${revenueIncreaseResult[0].totalAmount.toLocaleString()}`
                : '+0';

        return {
            candidates: { total: totalCandidates, new: newCandidates },
            Companies: { total: totalCompanies, new: newCompanies, pending: pendingCompanies },
            jobPostings: { total: totalJobPostings, new: newJobPostings },
            revenue: { total: revenue, new: revenueIncrease },
        };
    }

    // src/overview/overview.service.ts
    async getAnalyticsAdmin(year: number) {
        const months = Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`);

        // User Growth
        const userGrowthCandidatesAgg = await this.candidateModel
            .aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(year, 0, 1),
                            $lte: new Date(year, 11, 31),
                        },
                    },
                },
                {
                    $group: {
                        _id: { $month: '$createdAt' },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { '_id': 1 } },
            ])
            .exec();

        const userGrowthCompaniesAgg = await this.companyModel
            .aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(year, 0, 1),
                            $lte: new Date(year, 11, 31),
                        },
                    },
                },
                {
                    $group: {
                        _id: { $month: '$createdAt' },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { '_id': 1 } },
            ])
            .exec();

        // Job Stats
        const jobStatsPostedAgg = await this.jobModel
            .aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(year, 0, 1),
                            $lte: new Date(year, 11, 31),
                        },
                    },
                },
                {
                    $group: {
                        _id: { $month: '$createdAt' },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { '_id': 1 } },
            ])
            .exec();

        const jobStatsAppliedAgg = await this.applicationModel
            .aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(year, 0, 1),
                            $lte: new Date(year, 11, 31),
                        },
                    },
                },
                {
                    $group: {
                        _id: { $month: '$createdAt' },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { '_id': 1 } },
            ])
            .exec();

        // Revenue Trend
        const revenueTrendAgg = await this.orderModel
            .aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(year, 0, 1),
                            $lte: new Date(year, 11, 31),
                        },
                    },
                },
                {
                    $group: {
                        _id: { $month: '$createdAt' },
                        totalAmount: { $sum: '$amount' },
                    },
                },
                { $sort: { '_id': 1 } },
            ])
            .exec();

        // Popular Skills từ bảng Skill
        const popularSkills = await this.skillModel
            .find()
            .sort({ popularity: -1 })
            .limit(10)
            .select('name popularity')
            .lean()
            .exec();

        // Application Status
        const applicationStatusAgg = await this.applicationModel
            .aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(year, 0, 1),
                            $lte: new Date(year, 11, 31),
                        },
                    },
                },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                    },
                },
                {
                    $project: {
                        status: '$_id',
                        count: 1,
                        _id: 0,
                    },
                },
            ])
            .exec();

        // Danh sách trạng thái cố định
        const statuses = ['Chờ xử lý', 'Đã xem', 'Chấp nhận', 'Từ chối'];
        const applicationStatus = statuses.map(status => {
            const found = applicationStatusAgg.find(item => item.status === status);
            return {
                status,
                count: found ? found.count : 0,
            };
        });

        // Chuyển đổi dữ liệu
        const candidates = Array(12).fill(0);
        const companies = Array(12).fill(0);
        const posted = Array(12).fill(0);
        const applied = Array(12).fill(0);
        const revenueData = Array(12).fill(0);

        userGrowthCandidatesAgg.forEach(item => { candidates[item._id - 1] = item.count; });
        userGrowthCompaniesAgg.forEach(item => { companies[item._id - 1] = item.count; });
        jobStatsPostedAgg.forEach(item => { posted[item._id - 1] = item.count; });
        jobStatsAppliedAgg.forEach(item => { applied[item._id - 1] = item.count; });
        revenueTrendAgg.forEach(item => { revenueData[item._id - 1] = item.totalAmount / 1000000; });

        return {
            userGrowth: { labels: months, candidates, companies },
            jobStats: { labels: months, posted, applied },
            revenueTrend: { labels: months, data: revenueData },
            popularSkills: popularSkills.map(skill => ({
                skill: skill.name,
                popularity: skill.popularity,
            })),
            applicationStatus,
        };
    }
}





