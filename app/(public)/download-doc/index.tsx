import { DocProps } from '@/utils/docInterface';
import { Image, Text } from 'native-base';
import {SafeAreaView, View} from 'react-native';

const sampleDoc: DocProps = {
    docId: "doc-001",
    docName: "Đề thi giữa kỳ HK251",
    subject: "Giải tích 1",
    docDownload: 1250,
    ratings: 4.5,
    ratingsCount: 342,
    price: 0,
    docUploadDate: "2025-10-01",
    uploader: "John Doe",
    description: "Giáo trình Giải tích cung cấp kiến thức nền tảng về giới hạn, đạo hàm và tích phân, giúp sinh viên hiểu và mô hình hóa các hiện tượng biến thiên trong tự nhiên và kỹ thuật. Đây là môn học cơ bản nhưng quan trọng trong chương trình đại học, giúp sinh viên có định hướng và nền tảng vững chắc trong việc học các môn học tiếp theo.",
    images: [
        require("@/assets/images/sampleDoc1.png"),
        require("@/assets/images/sampleDoc2.png"),
        require("@/assets/images/sampleDoc3.png"),
        require("@/assets/images/sampleDoc4.png"),
        require("@/assets/images/sampleDoc5.png"),
        require("@/assets/images/sampleDoc6.png"),
        require("@/assets/images/sampleDoc7.png"),
    ]
};

export default function DownloadDoc(doc: DocProps) {
    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
            <View className="w-full h-24 bg-primary-500 absolute z-0 flex justify-end py-4">
                <Text className="font-bold text-lg text-white text-center">Chi tiết</Text>
            </View>

            <Image
                source={sampleDoc.images[0]}
                alt="sampleDoc"
                resizeMode={"cover"}
                width={"100%"}
                height={"100%"}
                style={{position: "absolute", zIndex: -10}}
            />

            
        </SafeAreaView>
    )
}
