<p align="center">
  <img src="https://go-zpkg.github.io/img/logo.svg" alt="go-zpkg" width="96" height="96">
</p>

<h1 align="center">go-zpkg</h1>

<p align="center">
  <em>A package manager in pure Go — run and install packages on <code>FROM scratch</code>,
  with one static binary each, a shared backend, and a signed, attested package registry.</em>
</p>

<p align="center">
  <a href="https://go-zpkg.github.io/">Home</a> ·
  <a href="https://go-zpkg.github.io/docs/latest/">Docs</a> ·
  <a href="https://github.com/go-zpkg/zpkgx">zpkgx</a> ·
  <a href="https://github.com/go-zpkg/zpkgm">zpkgm</a> ·
  <a href="https://github.com/go-zpkg/artifact">artifact</a>
</p>

---

Everything is `CGO_ENABLED=0` Go with no runtime dependencies of its own — single
static binaries that materialise a package's full dependency closure on demand and
work on a literally-empty `FROM scratch` image.

`zpkgm` **installs**, `zpkgx` **runs** without installing, and `zpkgs` **answers
about** packages. The last two ship from one release, because the word after
`zpkgx` is a *package*: `zpkgx ls` runs GNU ls, so the verbs needed a command of
their own.

| repo | role |
| --- | --- |
| [**zpkgx**](https://github.com/go-zpkg/zpkgx) | **runtime** — run packages on the fly (`zpkgx node@22`), bring several into an environment (`zpkgx +git +bash -- …`), and name and load environments with a module system that needs no Lmod |
| [**zpkgm**](https://github.com/go-zpkg/zpkgm) | **installer** — `install`/`uninstall`/`shim`/`list`/…, plus a `run` for scratch images |
| [**artifact**](https://github.com/go-zpkg/artifact) | **shared backend** — the artifact protocol: resolution, download, soname-exact `FROM scratch` closure completion, loader-aware exec |
| [**zpkb**](https://github.com/go-zpkg/zpkb) | **build tool** — a pure-Go brewkit: builds a pantry recipe and packages an artifact, with the build *target* a first-class value, so Windows PE artifacts cross-build from a linux host |
| [**packages**](https://github.com/go-zpkg/packages) | **registry** — a pure-Go factory that builds **our own** recipes with `zpkb` and publishes **signed, attested** artifacts (SBOM + SLSA provenance + signature) |
| [**pantry-overlay**](https://github.com/go-zpkg/pantry-overlay) | **our recipes** — read through `ZPKG_PANTRY_OVERLAY`. Each one records in `provenance` which of the project's *own* build files it was written from, and separately whose packaging was read for facts |
| [**mirror**](https://github.com/go-zpkg/mirror) | **mirror** — sync a local mirror of artifacts; serve it and point tools at it with `ZPKG_DIST` |
| [**registry-viewer**](https://github.com/go-zpkg/registry-viewer) | **the tree at <https://go-zpkg.github.io/packages/>** — a `CGO_ENABLED=0` WASM app drawing the registry as a filterable `TreeTable` to a `<canvas>`, with go-widgets/toolkit and go-widgets/painter, from the `registry.json` the factory emits |
| [**docs**](https://github.com/go-zpkg/docs) | **the documentation site** at <https://go-zpkg.github.io/docs/latest/> |
| [**brand**](https://github.com/go-zpkg/brand) | **logos and icons** |

## Install

One line each — it grabs the static binary for your os/arch from the named
release and verifies it against `SHA256SUMS`:

```sh
# Linux / macOS
curl -fsSL https://go-zpkg.github.io/install.sh | sh -s -- zpkgm v0.10.0
curl -fsSL https://go-zpkg.github.io/install.sh | sh -s -- zpkgx v0.39.0
curl -fsSL https://go-zpkg.github.io/install.sh | sh -s -- zpkgs v0.39.0
```

```powershell
# Windows (PowerShell)
irm https://go-zpkg.github.io/install.ps1 | iex
```

The version is named on purpose: this line copied today and the same line copied
in six months install the same bytes. Write `latest` where the version goes to
ask for the newest instead. Re-running *is* the updater — it skips the download
when the target version is already installed, and `ZPKGM_FORCE=1` reinstalls
anyway. Go users can `go install github.com/go-zpkg/zpkgm@latest`.

All three import `go-zpkg/artifact`, so there is one source of truth and no
duplication. `net/http` with an embedded CA bundle replaces curl+openssl;
`compress/gzip` + a pure-Go xz decoder replace info-zip+xz. The `packages`
factory signs every artifact against a pinned key, and `ZPKG_VERIFY=1` refuses
anything that does not verify. Everything is BSD-3-Clause, and CI does not stop
at cross-compiling: the suites **run** under `qemu-user` on arm64, riscv64,
ppc64le, s390x and loong64 — s390x because it is big-endian and nothing else is,
and this code reads formats it did not write.

The recipes are **written, not converted**: the upstream pantry this project
once tracked carries no licence, so it cannot seed ours. A source digest is
pinned in the recipe, and where upstream publishes a detached signature it is
verified at the moment that digest is recorded — against a key named by
fingerprint, with no keyserver ever asked.
