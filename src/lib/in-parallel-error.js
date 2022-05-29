export class InParallelError extends Error {
	constructor(causeResult, allResults) {
		super(`"${causeResult.name}" exited with ${causeResult.code}.`);
		this.name = causeResult.name;
		this.code = causeResult.code;
		this.results = allResults;
	}
}
