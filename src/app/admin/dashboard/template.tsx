import PageAnimation from "@/components/ui/page-animation";

export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
    return (
        <PageAnimation>
            {children}
        </PageAnimation>
    );
}
