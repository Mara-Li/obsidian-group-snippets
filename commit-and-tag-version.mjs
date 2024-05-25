import { Command, Option } from "commander";
import commitAndTagVersion from "commit-and-tag-version";
import dedent from "dedent";
import { theme, red, dim, gray, italic, bold, cyan, blue, green, underline as _underline, yellow, em as _em, heading as _heading, info as _info } from "ansi-colors";

const program = new Command();

theme({
	danger: red,
	dark: dim.gray,
	disabled: gray,
	em: italic,
	heading: bold.underline,
	info: cyan,
	muted: dim,
	primary: blue,
	strong: bold,
	success: green.bold,
	underline: _underline,
	warning: yellow.underline,
});

program
	.description("Bump version and create a new tag")
	.option("-b, --beta", "Pre-release version")
	.option("--dry-run", "Dry run")
	.addOption(
		new Option("-r, --release-as <size>", "release type version").choices([
			"major",
			"minor",
			"patch",
		])
	);

program.parse();
const opt = program.opts();

const betaMsg = opt.beta ? _em("- Pre-release\n\t") : "";
const dryRunMsg = opt.dryRun ? _em("- Dry run\n\t") : "";
const releaseAsMsg = opt.releaseAs
	? _em(`- Release as ${_underline(opt.releaseAs)}`)
	: "";

const msg = dedent(`
${_heading("Options :")}
	${betaMsg}${dryRunMsg}${releaseAsMsg}  
`);

console.log(msg);
console.log();

if (opt.beta) {
	console.log(`${bold.green(">")} ${_info.underline("Bumping beta version...")}`);
	console.log();
	const bumpFiles = [
		{
			filename: "manifest-beta.json",
			type: "json",
		},
		{
			filename: "package.json",
			type: "json",
		},
		{
			filename: "package-lock.json",
			type: "json",
		},
	];
	commitAndTagVersion({
		infile: "CHANGELOG-beta.md",
		bumpFiles: bumpFiles,
		prerelease: "",
		dryRun: opt.dryRun,
		tagPrefix: "",
	})
		.then(() => {
			console.log("Done");
		})
		.catch((err) => {
			console.error(err);
		});
} else {
	const versionBumped = opt.releaseAs
		? _info("Release as " + _underline(opt.releaseAs))
		: _info("Release");
	console.log(`${bold.green(">")} ${_underline(versionBumped)}`);
	console.log();

	const bumpFiles = [
		{
			filename: "manifest-beta.json",
			type: "json",
		},
		{
			filename: "package.json",
			type: "json",
		},
		{
			filename: "package-lock.json",
			type: "json",
		},
		{
			filename: "manifest.json",
			type: "json",
		}
	];


	commitAndTagVersion({
		infile: "CHANGELOG.md",
		bumpFiles: bumpFiles,
		dryRun: opt.dryRun,
		tagPrefix: "",
		releaseAs: opt.releaseAs,
	})
		.then(() => {
			console.log("Done");
		})
		.catch((err) => {
			console.error(err);
		});
}