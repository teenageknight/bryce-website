// import { useNavigate } from "react-router-dom";
import { BACKGROUND_COLOR } from "../styles/consts";
import Markdown from "react-markdown";
import aboutme from "../assets/markdown/aboutme.md?raw";
import ProfilePic from "../assets/images/profile.jpeg";
import { PortfolioCard } from "../components/portfolio-card/portfolio-card";

// TODO: The hard coded colors on this page should be switched to dynamic, they are set to this hard coded cause tailwind
//       cannot render dynamic colors.
// TODO: Dynamically pull this information from Github using a token
export function HomePage() {
    // const navigate = useNavigate();

    return (
        <div className={`h-full`} style={{ backgroundColor: `${BACKGROUND_COLOR}` }}>
            <div className="m-4 pb-5">
                <h1 className="text-3xl font-bold pb-3">Welcome to my website</h1>
                <p className="w-3/4 text-[#8D96A0]">
                    This site is a work in progress, but a place for me to share the projects that I am working on but
                    also create MVP solutions for small hobby projects. The projects maintained on my GitHub. And yes,
                    the design is stolen from GitHub, I am not a designer :(
                </p>
            </div>
            <div className="grid grid-cols-3 m-4">
                <div className="flex flex-col col-span-1">
                    <img
                        src={ProfilePic}
                        className="h-2/3 rounded-full border-2 w-fit"
                        style={{ borderColor: "#30363D" }}
                    />
                    <div>
                        <p className="text-2xl font-bold pt-4">Bryce Jackson</p>
                        <p className="text-xl text-[#8D96A0]">teenageknight</p>
                        <p className="font-semibold mt-3">Associate Consultant @CapTech</p>
                    </div>
                </div>
                <div className="flex-col col-span-2 flex">
                    <div className="border-2 rounded p-4 h-fit" style={{ borderColor: "#30363D" }}>
                        <a className={"font-semibold text-sm"} href="https://github.com/teenageknight/teenageknight">
                            teenageknight / README.md
                        </a>
                        <Markdown className="markdown">{aboutme}</Markdown>
                    </div>
                    <div onClick={() => {}} className="h-max mt-3">
                        <p className="font-semibold text-lg my-2">Portfolio</p>
                        {/* TODO: Create a component out of this */}
                        <a href="/fwa-census-calculator">
                            <PortfolioCard
                                title={"FWA Data Project"}
                                description="This is a collection of tooling designed to assist Food Well Allience better their understanding of data"
                            />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
