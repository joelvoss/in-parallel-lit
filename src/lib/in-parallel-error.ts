interface Result {
	name: string;
	code?: number | null;
}

export class InParallelError extends Error {
	code;
	results;

	constructor(causeResult: Result, allResults: Result[]) {
		super(`"${causeResult.name}" exited with ${causeResult.code}.`);
		this.name = causeResult.name;
		this.code = causeResult.code;
		this.results = allResults;
	}
}
