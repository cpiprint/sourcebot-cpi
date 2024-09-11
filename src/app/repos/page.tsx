import { Suspense } from "react";
import { NavigationMenu } from "../navigationMenu";
import { RepositoryTable } from "./repositoryTable";

export default function ReposPage() {
    return (
        <div className="h-screen flex flex-col items-center">
            <NavigationMenu />
            <Suspense fallback={<div>Loading...</div>}>
                <RepositoryTable />
            </Suspense>
        </div>
    )
}