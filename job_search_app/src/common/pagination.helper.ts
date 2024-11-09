import { Model } from 'mongoose';
import aqp from 'api-query-params';

export async function paginate<T>(
  model: Model<T>,
  currentPage: number,
  qr: string,
  limit = 10
) {
  // Sử dụng aqp để phân tích chuỗi query
  const { filter, sort, population } = aqp(qr);
  delete filter.page;

  // Tính toán số lượng bản ghi cần bỏ qua dựa trên trang hiện tại và số phần tử mỗi trang
  const skip = (currentPage - 1) * limit;

  // Tổng số phần tử
  const totalItems = await model.countDocuments(filter).exec();
  // Tính toán tổng số trang
  const totalPages = Math.ceil(totalItems / limit);

  // Truy vấn dữ liệu
  const result = await model
    .find(filter)
    .skip(skip)
    .limit(limit)
    .populate(population)
    .exec();

  return {
    meta: {
      currentPage,
      totalItems,
      totalPages,
    },
    result,
  };
}
