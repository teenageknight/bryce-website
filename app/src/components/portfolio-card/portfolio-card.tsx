import { BookmarkSquareIcon } from "@heroicons/react/24/outline";

enum PortfolioCardVariant {
    DEFAULT = "DEFAULT",
    REPO = "REPO",
}

type PortfolioCardProps = {
    title: string;
    description: string;
    tags?: string[];
    variant?: PortfolioCardVariant;
};
// React.DOMAttributes<HTMLDivElement>.onClick
export const PortfolioCard = ({ title, description, variant }: PortfolioCardProps): React.JSX.Element => {
    return (
        <div className="border-2 rounded p-3 border-[#30363D] hover:border-white w-1/2">
            <div className="flex pb-2">
                {variant === PortfolioCardVariant.REPO ? (
                    <BookmarkSquareIcon className="size-6" />
                ) : (
                    <BookmarkSquareIcon className="size-6 stroke-[#8D96A0]" />
                )}
                <p className="font-semibold pl-2">{title}</p>
            </div>
            <p className="text-[#8D96A0]">{description}</p>
            <div className="pt-2">
                <p>Tags</p>
            </div>
        </div>
    );
};
