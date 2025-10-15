import { IOnboardSlide } from './interfaces';

export const slides: IOnboardSlide[] = [
  {
    id: 'intro',
    title: 'Không cần tìm nữa mọi thứ bạn cần đều ở một nơi.',
    description:
      'Tất cả slide, giáo trình và đề thi cũ được tập hợp ở một nơi, dễ dàng và nhanh chóng để tìm kiếm.',
    image: require('@/assets/images/onboard1.png'),
    primaryCta: 'Bắt đầu',
  },
  {
    id: 'built-by-students',
    title: 'Được xây dựng bởi sinh viên, dành cho sinh viên.',
    description:
      'Không trùng lặp, không thiếu tài liệu. Được cập nhật cùng nhau bởi giảng viên, câu lạc bộ và sinh viên.',
    image: require('@/assets/images/onboard2.png'),
    primaryCta: 'Tiếp tục',
  },
  {
    id: 'share-knowledge',
    title: 'Chia sẻ tri thức khiến chúng ta trở nên tiến bộ hơn.',
    description:
      'Tải lên tức thì, tải xuống trơn tru. Khám phá những gợi ý thông minh, giúp bạn tiếp cận mọi tài liệu trong môn học.',
    image: require('@/assets/images/onboard3.png'),
    primaryCta: 'Tiếp tục',
  },
];

