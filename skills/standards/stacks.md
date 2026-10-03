# Default tools by stack

An example based on popular languages and tools, **not an exhaustive list**.
What the repo already uses always wins; these fill gaps. Recommended first,
alternatives in brackets. Stacks not listed: pick the ecosystem's mainstream
equivalent for each column.

| Stack | Format | Lint | Types | Test | Dead code | Security / validate |
|---|---|---|---|---|---|---|
| Python | ruff format | ruff check | pyright [mypy] | pytest | vulture | ruff `S` rules (bandit) |
| JS / TS | prettier [biome] | eslint [biome] | tsc | vitest [jest] | knip | `npm audit` / `pnpm audit` |
| Go | gofmt | golangci-lint | (compiler) | go test | deadcode | govulncheck |
| Rust | rustfmt | clippy | (compiler) | cargo test | (compiler warnings) | cargo audit |
| C# / .NET | dotnet format | Roslyn analyzers (`dotnet build -warnaserror`) | (compiler) | dotnet test (xUnit [NUnit]) | unused-member analyzers (IDE0051/0052) | `dotnet list package --vulnerable` |
| Java | google-java-format [Spotless] | Checkstyle [PMD] | (compiler) | JUnit via `gradle test` / `mvn test` | PMD unused rules | OWASP dependency-check [trivy] |
| CloudFormation | - | cfn-lint | - | - | - | `aws cloudformation validate-template`, checkov [cfn-guard] |
| Terraform | terraform fmt | tflint | terraform validate | terraform test | - | checkov [trivy] |
| Ansible | - | ansible-lint | - | molecule | - | `ansible-playbook --syntax-check`, ansible-lint production profile |
| Shell (bash) | shfmt | shellcheck | - | bats | - | - |
| PowerShell | - | PSScriptAnalyzer | - | Pester | - | - |
| Docker / k8s | - | hadolint / kubeconform | - | - | - | trivy |
| YAML / Markdown | - | yamllint / markdownlint | - | - | - | - |

## Package managers

The repo's lockfile decides. Otherwise the recommended one, or the fallback
when it isn't installed.

| Stack | Recommended | Fallback |
|---|---|---|
| Python | uv | pip + venv [poetry] |
| JS / TS | pnpm | npm |
| Java | Gradle | Maven |
| .NET | dotnet CLI (NuGet) | - |
| Go / Rust | go modules / cargo | - |
| Ansible | ansible-galaxy (`requirements.yml`) | - |
| Terraform | `terraform init` (registry) | - |
