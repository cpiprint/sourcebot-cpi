'use client';

import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ZoektFileMatch } from "@/lib/types";
import { Scrollbar } from "@radix-ui/react-scroll-area";
import { useMemo, useState } from "react";
import { DoubleArrowDownIcon, DoubleArrowUpIcon, FileIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import clsx from "clsx";
import { getRepoCodeHostInfo } from "@/lib/utils";

const MAX_MATCHES_TO_PREVIEW = 5;

interface SearchResultsProps {
    fileMatches: ZoektFileMatch[];
    onOpenFileMatch: (fileMatch: ZoektFileMatch, matchIndex: number) => void;
}

export const SearchResults = ({
    fileMatches,
    onOpenFileMatch,
}: SearchResultsProps) => {
    return (
        <ScrollArea className="h-full">
            <div className="flex flex-col gap-2">
                {fileMatches.map((fileMatch, index) => (
                    <FileMatch
                        key={index}
                        match={fileMatch}
                        onOpenFile={(matchIndex) => {
                            onOpenFileMatch(fileMatch, matchIndex);
                        }}
                    />
                ))}
            </div>
            <Scrollbar orientation="vertical" />
        </ScrollArea>
    )
}

interface FileMatchProps {
    match: ZoektFileMatch;
    onOpenFile: (matchIndex: number) => void;
}

const FileMatch = ({
    match,
    onOpenFile,
}: FileMatchProps) => {

    const [showAll, setShowAll] = useState(false);
    const matchCount = useMemo(() => {
        return match.Matches.length;
    }, [match]);

    const matches = useMemo(() => {
        const sortedMatches = match.Matches.sort((a, b) => {
            return a.LineNum - b.LineNum;
        });

        if (!showAll) {
            return sortedMatches.slice(0, MAX_MATCHES_TO_PREVIEW);
        }

        return sortedMatches;
    }, [match, showAll]);

    const { repoIcon, repoName, repoLink } = useMemo(() => {
        const info = getRepoCodeHostInfo(match.Repo);
        if (info) {
            return {
                repoName: info.repoName,
                repoLink: info.repoLink,
                repoIcon: <Image
                    src={info.icon}
                    alt={info.costHostName}
                    className="w-4 h-4 dark:invert"
                />
            }
        }

        return {
            repoName: match.Repo,
            repoLink: undefined,
            repoIcon: <FileIcon className="w-4 h-4" />
        }
    }, [match]);

    return (
        <div>
            <div className="bg-cyan-200 dark:bg-cyan-900 primary-foreground px-2 flex flex-row gap-2 items-center">
                {repoIcon}
                <span
                    className={clsx("font-medium", {
                        "cursor-pointer hover:underline": repoLink,
                    })}
                    onClick={() => {
                        if (repoLink) {
                            window.open(repoLink, "_blank");
                        }
                    }}
                >
                    {repoName}
                </span>
                <span>· {match.FileName}</span>
            </div>
            {matches.map((match, index) => {
                const fragment = match.Fragments[0];

                return (
                    <div
                        key={index}
                        className="font-mono px-4 py-0.5 text-sm cursor-pointer"
                        onClick={() => {
                            onOpenFile(index);
                        }}
                    >
                        <p>{match.LineNum > 0 ? match.LineNum : "file match"}: {fragment.Pre}<span className="font-bold">{fragment.Match}</span>{fragment.Post}</p>
                        <Separator />
                    </div>
                );
            })}
            {matchCount > MAX_MATCHES_TO_PREVIEW && (
                <div className="px-4">
                    <p
                        onClick={() => setShowAll(!showAll)}
                        className="text-blue-500 cursor-pointer text-sm flex flex-row items-center gap-2"
                    >
                        {showAll ? <DoubleArrowUpIcon className="w-3 h-3" /> : <DoubleArrowDownIcon className="w-3 h-3" />}
                        {showAll ? `Show fewer matching lines` : `Show ${matchCount - MAX_MATCHES_TO_PREVIEW} more matching lines`}
                    </p>
                </div>
            )}
        </div>
    );
}
