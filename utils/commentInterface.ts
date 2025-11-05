import { ImageSourcePropType } from 'react-native';

export interface CommentProps{
    star: number;
    content: string;
    commenterAvatar: ImageSourcePropType;
    commenterName: string;
    images?: any[];
}