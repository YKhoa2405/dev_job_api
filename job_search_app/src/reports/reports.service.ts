import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Report } from './schemas/report.schema';
import { AxiosError } from 'axios';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);
  private readonly CLASSIFY_API_URL = 'http://localhost:8001/apip/classify'; // URL của API FastAPI
  constructor(
    @InjectModel(Report.name) private reportModel: Model<Report>,
    private readonly httpService: HttpService,
  ) { }
  async create(createReportDto: CreateReportDto, user: IUser): Promise<Report> {
    const { reason, selectedCategory, jobId } = createReportDto;
    const userId = user._id;
    const existingReport = await this.reportModel.findOne({
      jobId,
      userId
    });
    if (existingReport) {
      throw new BadRequestException('Bạn đã báo cáo tin tuyển dụng này.');
    }

    let category = 'Chưa phân loại';

    // Nếu người dùng chọn "Lừa đảo", gán trực tiếp category là "Lừa đảo" và không gọi AI
    if (selectedCategory === 'Lừa đảo') {
      category = 'Lừa đảo';
    } else {
      // Nếu không chọn "Lừa đảo", gọi API AI để phân loại
      try {
        const response = await firstValueFrom(
          this.httpService.post(this.CLASSIFY_API_URL, { reason }),
        );
        category = response.data.category;

        // Kiểm tra danh mục hợp lệ
        if (!['Lừa đảo', 'Nội dung không phù hợp', 'Ứng xử không chuyên nghiệp'].includes(category)) {
          this.logger.warn(`Danh mục không hợp lệ: ${category}, gán mặc định là "Chưa phân loại"`);
          category = 'Chưa phân loại';
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          this.logger.error(
            `Lỗi khi gọi microservice FastAPI: ${error.message}, status: ${error.response?.status}, data: ${JSON.stringify(error.response?.data)}`,
          );
        } else {
          this.logger.error(`Lỗi không xác định khi gọi microservice FastAPI: ${error.message}`);
        }
      }
    }

    // Lưu báo cáo với danh mục đã phân loại
    const createdReport = new this.reportModel({
      ...createReportDto,
      category,
      userId
    });
    return createdReport.save();
  }

  async findAll(): Promise<Report[]> {
    return this.reportModel.find().exec();
  }

  async getReportByJob(jobId: string, currentPage: number, limit: number, qr: string): Promise<{ meta: any; result: Report[] }> {
    const { filter, sort, population, projection } = aqp(qr);
    delete filter.page;
    delete filter.pageSize;

    // Gán jobId vào filter
    filter.jobId = jobId;

    // Tính toán phân trang
    const skip = (currentPage - 1) * limit;
    const defaultLimit = limit || 10; // Sử dụng toán tử || thay vì toán tử ba ngôi để đơn giản hóa

    // Đếm tổng số báo cáo phù hợp với filter
    const totalItems = await this.reportModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    // Lấy danh sách báo cáo
    const result = await this.reportModel
      .find(filter)
      .skip(skip)
      .limit(defaultLimit)
      .sort({ createdAt: -1 }) // Sắp xếp theo createdAt giảm dần
      .populate(population || []) // Populate nếu có
      .select(projection || {}) // Áp dụng projection nếu có
      .lean()
      .exec();

    // Trả về kết quả với meta data
    return {
      meta: {
        currentPage,
        pageSize: defaultLimit, // Sửa pageLimit thành defaultLimit
        totalItems,
        totalPages,
      },
      result,
    };
  }

  update(id: string, category: string) {
    return this.reportModel.updateOne({ _id: id }, { category })
  }


  remove(id: number) {
    return `This action removes a #${id} report`;
  }
}
