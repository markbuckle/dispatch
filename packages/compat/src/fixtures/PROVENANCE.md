# Provenance - the test fixtures

Real third-party email HTML, not examples written to make the checks pass.

| File | Source | Licence | Why this one |
|---|---|---|---|
| `cerberus-fluid.html` | `github.com/TedGoas/Cerberus` | MIT | A production table based template. Uses none of the four features, so the engine has to stay silent. |
| `cerberus-responsive.html` | `github.com/TedGoas/Cerberus` | MIT | Same, plus `background-position`, the declaration a substring matcher mistakes for `position`. |
| `caniemail-css-flexbox.html` | `github.com/hteumeuleu/caniemail`, `tests/` | MIT | The document caniemail sends through real clients to produce the `css-display-flex` support codes. |
| `caniemail-css-variables.html` | `github.com/hteumeuleu/caniemail`, `tests/` | MIT | The same, for `css-variables`. |

The two caniemail files are the point: the fixture and the expected client list come
out of the same real test run, so asserting one against the other compares the engine
against the measurement rather than against a second guess.

Retrieved 2026-09-21.
