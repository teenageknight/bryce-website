import { getCensusDataQuery } from "../services/functions";
export function HomePage() {
    return (
        <div>
            <h1>Home Page</h1>
            <button
                onClick={() => {
                    console.log("test");
                    getCensusDataQuery();
                }}>
                test
            </button>
        </div>
    );
}
