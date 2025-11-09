export interface BountyCategory {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface BountyPrize {
    place: string;
    prize: number;
}

export interface Submission {
    id: number;
    bounty_id: number;
    wallet_address: string;
    twitter_handle: string;
    tweet_link: string;
    extra_info?: string | null;
}

export interface Bounty {
    id: number;
    title: string,
    description: string,
    requirements: string,
    category_id: number,
    end_date: string,
    prizes: BountyPrize[],

    category?: BountyCategory | null;

    submissions?: Submission[];
    submissions_total?: number;

    winners?: {
        position: string,
        submission: Submission
    }[]
}