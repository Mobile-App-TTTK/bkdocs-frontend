import FollowingScreen from "@/components/FollowingScreen";
import { useRouter } from "expo-router";

export default function FollowingPage() {
    const router = useRouter();
    return <FollowingScreen onBack={() => router.back()} />;
}

