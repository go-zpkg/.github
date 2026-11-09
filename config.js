// Renovate for this organisation, and only this one.
//
// One organisation is a few repositories, so a run never comes near the five
// thousand API requests an hour a token has. A shared runner over hundreds of
// organisations does, and then it walks the list in the same order every time
// and the tail is never reached — silently, while the head keeps producing
// pull requests and the whole thing looks like it works. That is why this is
// here rather than in a fleet-wide runner.
//
// Each repository extends default.json beside this file, which is where the
// policy lives.
module.exports = {
  platform: 'github',
  // The account blocks pushes that expose a non-noreply email, and Renovate's
  // default author is bot@renovateapp.com. Left alone, every branch push is
  // rejected and the run still reports success.
  gitAuthor: 'tannevaled <tannevaled@users.noreply.github.com>',
  autodiscover: true,
  // ⛔⛔ THIS NAMED go-pkgx, AND THIS ORGANISATION IS go-zpkg. autodiscover
  // lists the installation's repositories under their CURRENT names, so a
  // filter naming the old organisation matches none of them — and Renovate
  // reports a successful run having examined nothing, which is the same silent
  // shape the comments above and below are both about.
  //
  // What is established: the filter named an organisation that no longer
  // exists, and Renovate's last activity in go-zpkg/zbk was #383, updated
  // 2026-11-04T01:31:11Z — one minute after this repository's last push, and
  // five days ago. What is NOT established is that the filter caused the
  // silence: "nothing since" is also what "nothing to update" looks like. The
  // next run is the test, and a filter naming a dead organisation is a defect
  // on its face whichever way that goes.
  autodiscoverFilter: ['go-zpkg/**'],
  onboarding: false,
  requireConfig: 'optional',
  dependencyDashboard: true,
  repositoryCache: 'enabled',
  // default.json beside this file is a PRESET, and a preset reaches a
  // repository only through an `extends` that names it. Sitting in the
  // organisation applies it to nothing: with onboarding:false and
  // requireConfig:'optional', a repository carrying no config file runs on
  // Renovate's factory defaults and says so only at debug level --
  // "No renovate config file found". Measured 2026-09-03: 77 of the 835
  // repositories across the 117 organisations that run Renovate were in that
  // state, so the Go toolchain guard in default.json had never been in force
  // on any of them.
  inheritConfig: true,
  inheritConfigRepoName: '{{parentOrg}}/.github',
  inheritConfigFileName: 'default.json',
  // Loud when absent. Left at its default of false, Renovate proceeds silently
  // when the file is missing -- the same failure, one level up.
  inheritConfigStrict: true,
};
