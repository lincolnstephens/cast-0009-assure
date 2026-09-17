
## Run 2026-09-17 10:53Z - https://6aabc643b3a76faa1f7da704--tessera-assure.netlify.app

**Operation:** ASSURE. **Iteration:** v1.0. **Verdict:** FAIL, 7 of 30.

| Line | Check | Result | Detail |
|---|---|---|---|
|  | static: source found | FAIL | no files matched source_globs (the app scaffold may not exist yet) |
|  | driven: definition of done present | PASS | 10 lines |
| 1 | L1 @1920x1080: Sign-in succeeds and lands on the client portal. | FAIL | sign-in email field not found: input[type='email'] |
| 2 | L2 @1920x1080: Every client portal view loads and renders a heading: Policy Guide, re | FAIL | KeyError: '_target' |
| 3 | L3 @1920x1080: Signed in as the operator, every admin view loads and renders a headin | FAIL | KeyError: '_target' |
| 4 | L4 @1920x1080: The Record table in the Value view renders at least one row. | FAIL | KeyError: '_target' |
| 5 | L5 @1920x1080: The Statement renders and contains the limitations paragraph. | FAIL | KeyError: '_target' |
| 6 | L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr | FAIL | KeyError: '_target' |
| 7 | L7 @1920x1080: Print output hides the header and navigation and shows the Statement. | FAIL | KeyError: '_target' |
| 9 | L9 @1920x1080: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1920x1080: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 1 | L1 @1366x768: Sign-in succeeds and lands on the client portal. | FAIL | sign-in email field not found: input[type='email'] |
| 2 | L2 @1366x768: Every client portal view loads and renders a heading: Policy Guide, re | FAIL | KeyError: '_target' |
| 3 | L3 @1366x768: Signed in as the operator, every admin view loads and renders a headin | FAIL | KeyError: '_target' |
| 4 | L4 @1366x768: The Record table in the Value view renders at least one row. | FAIL | KeyError: '_target' |
| 5 | L5 @1366x768: The Statement renders and contains the limitations paragraph. | FAIL | KeyError: '_target' |
| 6 | L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr | FAIL | KeyError: '_target' |
| 7 | L7 @1366x768: Print output hides the header and navigation and shows the Statement. | FAIL | KeyError: '_target' |
| 9 | L9 @1366x768: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1366x768: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 1 | L1 @390x844: Sign-in succeeds and lands on the client portal. | FAIL | sign-in email field not found: input[type='email'] |
| 2 | L2 @390x844: Every client portal view loads and renders a heading: Policy Guide, re | FAIL | KeyError: '_target' |
| 3 | L3 @390x844: Signed in as the operator, every admin view loads and renders a headin | FAIL | KeyError: '_target' |
| 4 | L4 @390x844: The Record table in the Value view renders at least one row. | FAIL | KeyError: '_target' |
| 5 | L5 @390x844: The Statement renders and contains the limitations paragraph. | FAIL | KeyError: '_target' |
| 6 | L6 @390x844: With the operator's show illustrative switch off, no illustrative entr | FAIL | KeyError: '_target' |
| 7 | L7 @390x844: Print output hides the header and navigation and shows the Statement. | FAIL | KeyError: '_target' |
| 8 | L8 @390x844: At 390 pixels wide, no view produces horizontal overflow. | FAIL | overflow on: guide:nav-missing, request:nav-missing, value:nav-missing, statement:nav-missing, posture:nav-missing, exposure:nav-missing |
| 9 | L9 @390x844: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @390x844: The deployed page declares noindex in the head. | PASS | noindex present in head |

**Failed:**

- static: source found: no files matched source_globs (the app scaffold may not exist yet)
- L1 @1920x1080: Sign-in succeeds and lands on the client portal.: sign-in email field not found: input[type='email']
- L2 @1920x1080: Every client portal view loads and renders a heading: Policy Guide, re: KeyError: '_target'
- L3 @1920x1080: Signed in as the operator, every admin view loads and renders a headin: KeyError: '_target'
- L4 @1920x1080: The Record table in the Value view renders at least one row.: KeyError: '_target'
- L5 @1920x1080: The Statement renders and contains the limitations paragraph.: KeyError: '_target'
- L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr: KeyError: '_target'
- L7 @1920x1080: Print output hides the header and navigation and shows the Statement.: KeyError: '_target'
- L1 @1366x768: Sign-in succeeds and lands on the client portal.: sign-in email field not found: input[type='email']
- L2 @1366x768: Every client portal view loads and renders a heading: Policy Guide, re: KeyError: '_target'
- L3 @1366x768: Signed in as the operator, every admin view loads and renders a headin: KeyError: '_target'
- L4 @1366x768: The Record table in the Value view renders at least one row.: KeyError: '_target'
- L5 @1366x768: The Statement renders and contains the limitations paragraph.: KeyError: '_target'
- L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr: KeyError: '_target'
- L7 @1366x768: Print output hides the header and navigation and shows the Statement.: KeyError: '_target'
- L1 @390x844: Sign-in succeeds and lands on the client portal.: sign-in email field not found: input[type='email']
- L2 @390x844: Every client portal view loads and renders a heading: Policy Guide, re: KeyError: '_target'
- L3 @390x844: Signed in as the operator, every admin view loads and renders a headin: KeyError: '_target'
- L4 @390x844: The Record table in the Value view renders at least one row.: KeyError: '_target'
- L5 @390x844: The Statement renders and contains the limitations paragraph.: KeyError: '_target'
- L6 @390x844: With the operator's show illustrative switch off, no illustrative entr: KeyError: '_target'
- L7 @390x844: Print output hides the header and navigation and shows the Statement.: KeyError: '_target'
- L8 @390x844: At 390 pixels wide, no view produces horizontal overflow.: overflow on: guide:nav-missing, request:nav-missing, value:nav-missing, statement:nav-missing, posture:nav-missing, exposure:nav-missing

## Run 2026-09-17 10:56Z - https://6aabc643b3a76faa1f7da704--tessera-assure.netlify.app

**Operation:** ASSURE. **Iteration:** v1.0. **Verdict:** FAIL, 23 of 36.

| Line | Check | Result | Detail |
|---|---|---|---|
|  | static: source found | PASS | 97 files |
|  | static: no banned term | FAIL | placeholder |
|  | static: no em dash in source | PASS |  |
|  | static: no retired colour | PASS |  |
|  | static: no restricted name present | PASS | 2 restricted names checked, 0 hits |
|  | static: no key value in source | PASS | 0 pattern(s) matched |
|  | static: print stylesheet present in source | PASS | '@media print' found |
|  | driven: definition of done present | PASS | 10 lines |
| 1 | L1 @1920x1080: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1920x1080: Every client portal view loads and renders a heading: Policy Guide, re | FAIL | failed: statement:no-heading |
| 3 | L3 @1920x1080: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @1920x1080: The Record table in the Value view renders at least one row. | PASS | 15 row(s) in [data-testid='record-table'] |
| 5 | L5 @1920x1080: The Statement renders and contains the limitations paragraph. | FAIL | [data-testid='statement'] not found |
| 6 | L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr | FAIL | [data-testid='statement'] not found |
| 7 | L7 @1920x1080: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1920x1080: No console errors or page errors occur across the whole run. | FAIL | 5 console or page errors: ['Failed to load resource: the server responded with a status of 401 ()', 'Failed to load resource: the server responded with a status of 401 ()', 'Failed to load resource: the server responded with a status of 401 ()'] |
| 10 | L10 @1920x1080: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 1 | L1 @1366x768: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1366x768: Every client portal view loads and renders a heading: Policy Guide, re | FAIL | failed: statement:no-heading |
| 3 | L3 @1366x768: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @1366x768: The Record table in the Value view renders at least one row. | PASS | 15 row(s) in [data-testid='record-table'] |
| 5 | L5 @1366x768: The Statement renders and contains the limitations paragraph. | FAIL | [data-testid='statement'] not found |
| 6 | L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr | FAIL | [data-testid='statement'] not found |
| 7 | L7 @1366x768: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1366x768: No console errors or page errors occur across the whole run. | FAIL | 5 console or page errors: ['Failed to load resource: the server responded with a status of 401 ()', 'Failed to load resource: the server responded with a status of 401 ()', 'Failed to load resource: the server responded with a status of 401 ()'] |
| 10 | L10 @1366x768: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 1 | L1 @390x844: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @390x844: Every client portal view loads and renders a heading: Policy Guide, re | FAIL | failed: statement:no-heading |
| 3 | L3 @390x844: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @390x844: The Record table in the Value view renders at least one row. | PASS | 15 row(s) in [data-testid='record-table'] |
| 5 | L5 @390x844: The Statement renders and contains the limitations paragraph. | FAIL | [data-testid='statement'] not found |
| 6 | L6 @390x844: With the operator's show illustrative switch off, no illustrative entr | FAIL | [data-testid='toggle-illustrative'] not found in the operator's settings |
| 7 | L7 @390x844: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 8 | L8 @390x844: At 390 pixels wide, no view produces horizontal overflow. | PASS | 6 views checked, no overflow |
| 9 | L9 @390x844: No console errors or page errors occur across the whole run. | FAIL | 6 console or page errors: ['Failed to load resource: the server responded with a status of 401 ()', 'Failed to load resource: the server responded with a status of 401 ()', 'Failed to load resource: the server responded with a status of 401 ()'] |
| 10 | L10 @390x844: The deployed page declares noindex in the head. | PASS | noindex present in head |

**Failed:**

- static: no banned term: placeholder
- L2 @1920x1080: Every client portal view loads and renders a heading: Policy Guide, re: failed: statement:no-heading
- L5 @1920x1080: The Statement renders and contains the limitations paragraph.: [data-testid='statement'] not found
- L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr: [data-testid='statement'] not found
- L9 @1920x1080: No console errors or page errors occur across the whole run.: 5 console or page errors: ['Failed to load resource: the server responded with a status of 401 ()', 'Failed to load resource: the server responded with a status of 401 ()', 'Failed to load resource: the server responded with a status of 401 ()']
- L2 @1366x768: Every client portal view loads and renders a heading: Policy Guide, re: failed: statement:no-heading
- L5 @1366x768: The Statement renders and contains the limitations paragraph.: [data-testid='statement'] not found
- L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr: [data-testid='statement'] not found
- L9 @1366x768: No console errors or page errors occur across the whole run.: 5 console or page errors: ['Failed to load resource: the server responded with a status of 401 ()', 'Failed to load resource: the server responded with a status of 401 ()', 'Failed to load resource: the server responded with a status of 401 ()']
- L2 @390x844: Every client portal view loads and renders a heading: Policy Guide, re: failed: statement:no-heading
- L5 @390x844: The Statement renders and contains the limitations paragraph.: [data-testid='statement'] not found
- L6 @390x844: With the operator's show illustrative switch off, no illustrative entr: [data-testid='toggle-illustrative'] not found in the operator's settings
- L9 @390x844: No console errors or page errors occur across the whole run.: 6 console or page errors: ['Failed to load resource: the server responded with a status of 401 ()', 'Failed to load resource: the server responded with a status of 401 ()', 'Failed to load resource: the server responded with a status of 401 ()']

## Run 2026-09-17 11:01Z - https://6aabc7f38da2e6a0342d97f1--tessera-assure.netlify.app

**Operation:** ASSURE. **Iteration:** v1.0. **Verdict:** FAIL, 33 of 36.

| Line | Check | Result | Detail |
|---|---|---|---|
|  | static: source found | PASS | 97 files |
|  | static: no banned term | PASS |  |
|  | static: no em dash in source | PASS |  |
|  | static: no retired colour | PASS |  |
|  | static: no restricted name present | PASS | 2 restricted names checked, 0 hits |
|  | static: no key value in source | PASS | 0 pattern(s) matched |
|  | static: print stylesheet present in source | PASS | '@media print' found |
|  | driven: definition of done present | PASS | 10 lines |
| 1 | L1 @1920x1080: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1920x1080: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @1920x1080: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @1920x1080: The Record table in the Value view renders at least one row. | PASS | 15 row(s) in [data-testid='record-table'] |
| 5 | L5 @1920x1080: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr | FAIL | 'illustrative' in the client statement with the switch off: True |
| 7 | L7 @1920x1080: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1920x1080: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1920x1080: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 1 | L1 @1366x768: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1366x768: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @1366x768: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @1366x768: The Record table in the Value view renders at least one row. | PASS | 15 row(s) in [data-testid='record-table'] |
| 5 | L5 @1366x768: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr | FAIL | 'illustrative' in the client statement with the switch off: True |
| 7 | L7 @1366x768: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1366x768: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1366x768: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 1 | L1 @390x844: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @390x844: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @390x844: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @390x844: The Record table in the Value view renders at least one row. | PASS | 15 row(s) in [data-testid='record-table'] |
| 5 | L5 @390x844: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @390x844: With the operator's show illustrative switch off, no illustrative entr | FAIL | 'illustrative' in the client statement with the switch off: True |
| 7 | L7 @390x844: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 8 | L8 @390x844: At 390 pixels wide, no view produces horizontal overflow. | PASS | 6 views checked, no overflow |
| 9 | L9 @390x844: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @390x844: The deployed page declares noindex in the head. | PASS | noindex present in head |

**Failed:**

- L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr: 'illustrative' in the client statement with the switch off: True
- L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr: 'illustrative' in the client statement with the switch off: True
- L6 @390x844: With the operator's show illustrative switch off, no illustrative entr: 'illustrative' in the client statement with the switch off: True

## Run 2026-09-17 11:06Z - https://6aabc7f38da2e6a0342d97f1--tessera-assure.netlify.app

**Operation:** ASSURE. **Iteration:** v1.0. **Verdict:** FAIL, 33 of 36.

| Line | Check | Result | Detail |
|---|---|---|---|
|  | static: source found | PASS | 97 files |
|  | static: no banned term | PASS |  |
|  | static: no em dash in source | PASS |  |
|  | static: no retired colour | PASS |  |
|  | static: no restricted name present | PASS | 2 restricted names checked, 0 hits |
|  | static: no key value in source | PASS | 0 pattern(s) matched |
|  | static: print stylesheet present in source | PASS | '@media print' found |
|  | driven: definition of done present | PASS | 10 lines |
| 1 | L1 @1920x1080: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1920x1080: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @1920x1080: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @1920x1080: The Record table in the Value view renders at least one row. | PASS | 15 row(s) in [data-testid='record-table'] |
| 5 | L5 @1920x1080: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr | FAIL | 'illustrative' in the client statement with the switch off: True |
| 7 | L7 @1920x1080: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1920x1080: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1920x1080: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 1 | L1 @1366x768: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1366x768: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @1366x768: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @1366x768: The Record table in the Value view renders at least one row. | PASS | 15 row(s) in [data-testid='record-table'] |
| 5 | L5 @1366x768: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr | FAIL | 'illustrative' in the client statement with the switch off: True |
| 7 | L7 @1366x768: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1366x768: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1366x768: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 1 | L1 @390x844: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @390x844: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @390x844: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @390x844: The Record table in the Value view renders at least one row. | PASS | 15 row(s) in [data-testid='record-table'] |
| 5 | L5 @390x844: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @390x844: With the operator's show illustrative switch off, no illustrative entr | FAIL | 'illustrative' in the client statement with the switch off: True |
| 7 | L7 @390x844: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 8 | L8 @390x844: At 390 pixels wide, no view produces horizontal overflow. | PASS | 6 views checked, no overflow |
| 9 | L9 @390x844: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @390x844: The deployed page declares noindex in the head. | PASS | noindex present in head |

**Failed:**

- L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr: 'illustrative' in the client statement with the switch off: True
- L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr: 'illustrative' in the client statement with the switch off: True
- L6 @390x844: With the operator's show illustrative switch off, no illustrative entr: 'illustrative' in the client statement with the switch off: True

## Run 2026-09-17 11:14Z - https://6aabca8d7e997a33bb1da204--tessera-assure.netlify.app

**Operation:** ASSURE. **Iteration:** v1.0. **Verdict:** PASS, 36 of 36.

| Line | Check | Result | Detail |
|---|---|---|---|
|  | static: source found | PASS | 97 files |
|  | static: no banned term | PASS |  |
|  | static: no em dash in source | PASS |  |
|  | static: no retired colour | PASS |  |
|  | static: no restricted name present | PASS | 2 restricted names checked, 0 hits |
|  | static: no key value in source | PASS | 0 pattern(s) matched |
|  | static: print stylesheet present in source | PASS | '@media print' found |
|  | driven: definition of done present | PASS | 10 lines |
| 1 | L1 @1920x1080: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1920x1080: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @1920x1080: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @1920x1080: The Record table in the Value view renders at least one row. | PASS | 1 row(s) in [data-testid='record-table'] |
| 5 | L5 @1920x1080: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1920x1080: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1920x1080: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1920x1080: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 1 | L1 @1366x768: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1366x768: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @1366x768: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @1366x768: The Record table in the Value view renders at least one row. | PASS | 1 row(s) in [data-testid='record-table'] |
| 5 | L5 @1366x768: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1366x768: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1366x768: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1366x768: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 1 | L1 @390x844: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @390x844: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @390x844: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @390x844: The Record table in the Value view renders at least one row. | PASS | 1 row(s) in [data-testid='record-table'] |
| 5 | L5 @390x844: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @390x844: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @390x844: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 8 | L8 @390x844: At 390 pixels wide, no view produces horizontal overflow. | PASS | 6 views checked, no overflow |
| 9 | L9 @390x844: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @390x844: The deployed page declares noindex in the head. | PASS | noindex present in head |

## Run 2026-09-17 11:21Z - https://6aabcc18df59a9e8d4d15588--tessera-assure.netlify.app

**Operation:** ASSURE. **Iteration:** v1.0. **Verdict:** FAIL, 31 of 36.

| Line | Check | Result | Detail |
|---|---|---|---|
|  | static: source found | PASS | 97 files |
|  | static: no banned term | PASS |  |
|  | static: no em dash in source | PASS |  |
|  | static: no retired colour | PASS |  |
|  | static: no restricted name present | PASS | 2 restricted names checked, 0 hits |
|  | static: no key value in source | PASS | 0 pattern(s) matched |
|  | static: print stylesheet present in source | PASS | '@media print' found |
|  | driven: definition of done present | PASS | 10 lines |
| 1 | L1 @1920x1080: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1920x1080: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @1920x1080: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @1920x1080: The Record table in the Value view renders at least one row. | FAIL | 0 row(s) in [data-testid='record-table'] |
| 5 | L5 @1920x1080: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr | FAIL | 'illustrative' in the client statement with the switch off: True |
| 7 | L7 @1920x1080: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1920x1080: No console errors or page errors occur across the whole run. | FAIL | 1 console or page errors: ['Failed to load resource: the server responded with a status of 401 ()'] |
| 10 | L10 @1920x1080: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 1 | L1 @1366x768: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1366x768: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @1366x768: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @1366x768: The Record table in the Value view renders at least one row. | PASS | 15 row(s) in [data-testid='record-table'] |
| 5 | L5 @1366x768: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr | FAIL | 'illustrative' in the client statement with the switch off: True |
| 7 | L7 @1366x768: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1366x768: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1366x768: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 1 | L1 @390x844: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @390x844: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @390x844: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @390x844: The Record table in the Value view renders at least one row. | PASS | 15 row(s) in [data-testid='record-table'] |
| 5 | L5 @390x844: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @390x844: With the operator's show illustrative switch off, no illustrative entr | FAIL | 'illustrative' in the client statement with the switch off: True |
| 7 | L7 @390x844: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 8 | L8 @390x844: At 390 pixels wide, no view produces horizontal overflow. | PASS | 6 views checked, no overflow |
| 9 | L9 @390x844: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @390x844: The deployed page declares noindex in the head. | PASS | noindex present in head |

**Failed:**

- L4 @1920x1080: The Record table in the Value view renders at least one row.: 0 row(s) in [data-testid='record-table']
- L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr: 'illustrative' in the client statement with the switch off: True
- L9 @1920x1080: No console errors or page errors occur across the whole run.: 1 console or page errors: ['Failed to load resource: the server responded with a status of 401 ()']
- L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr: 'illustrative' in the client statement with the switch off: True
- L6 @390x844: With the operator's show illustrative switch off, no illustrative entr: 'illustrative' in the client statement with the switch off: True

## Run 2026-09-17 11:24Z - https://6aabcc18df59a9e8d4d15588--tessera-assure.netlify.app

**Operation:** ASSURE. **Iteration:** v1.0. **Verdict:** FAIL, 33 of 36.

| Line | Check | Result | Detail |
|---|---|---|---|
|  | static: source found | PASS | 97 files |
|  | static: no banned term | PASS |  |
|  | static: no em dash in source | PASS |  |
|  | static: no retired colour | PASS |  |
|  | static: no restricted name present | PASS | 2 restricted names checked, 0 hits |
|  | static: no key value in source | PASS | 0 pattern(s) matched |
|  | static: print stylesheet present in source | PASS | '@media print' found |
|  | driven: definition of done present | PASS | 10 lines |
| 1 | L1 @1920x1080: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1920x1080: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @1920x1080: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @1920x1080: The Record table in the Value view renders at least one row. | PASS | 15 row(s) in [data-testid='record-table'] |
| 5 | L5 @1920x1080: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr | FAIL | 'illustrative' in the client statement with the switch off: True |
| 7 | L7 @1920x1080: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1920x1080: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1920x1080: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 1 | L1 @1366x768: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1366x768: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @1366x768: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @1366x768: The Record table in the Value view renders at least one row. | PASS | 15 row(s) in [data-testid='record-table'] |
| 5 | L5 @1366x768: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr | FAIL | 'illustrative' in the client statement with the switch off: True |
| 7 | L7 @1366x768: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1366x768: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1366x768: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 1 | L1 @390x844: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @390x844: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @390x844: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @390x844: The Record table in the Value view renders at least one row. | PASS | 15 row(s) in [data-testid='record-table'] |
| 5 | L5 @390x844: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @390x844: With the operator's show illustrative switch off, no illustrative entr | FAIL | 'illustrative' in the client statement with the switch off: True |
| 7 | L7 @390x844: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 8 | L8 @390x844: At 390 pixels wide, no view produces horizontal overflow. | PASS | 6 views checked, no overflow |
| 9 | L9 @390x844: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @390x844: The deployed page declares noindex in the head. | PASS | noindex present in head |

**Failed:**

- L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr: 'illustrative' in the client statement with the switch off: True
- L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr: 'illustrative' in the client statement with the switch off: True
- L6 @390x844: With the operator's show illustrative switch off, no illustrative entr: 'illustrative' in the client statement with the switch off: True

## Run 2026-09-17 11:38Z - https://6aabcfc7e21be0115e94c8c1--tessera-assure.netlify.app

**Operation:** ASSURE. **Iteration:** v1.0. **Verdict:** PASS, 36 of 36.

| Line | Check | Result | Detail |
|---|---|---|---|
|  | static: source found | PASS | 98 files |
|  | static: no banned term | PASS |  |
|  | static: no em dash in source | PASS |  |
|  | static: no retired colour | PASS |  |
|  | static: no restricted name present | PASS | 2 restricted names checked, 0 hits |
|  | static: no key value in source | PASS | 0 pattern(s) matched |
|  | static: print stylesheet present in source | PASS | '@media print' found |
|  | driven: definition of done present | PASS | 10 lines |
| 1 | L1 @1920x1080: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1920x1080: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @1920x1080: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @1920x1080: The Record table in the Value view renders at least one row. | PASS | 15 row(s) in [data-testid='record-table'] |
| 5 | L5 @1920x1080: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1920x1080: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1920x1080: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1920x1080: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 1 | L1 @1366x768: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1366x768: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @1366x768: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @1366x768: The Record table in the Value view renders at least one row. | PASS | 15 row(s) in [data-testid='record-table'] |
| 5 | L5 @1366x768: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1366x768: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1366x768: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1366x768: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 1 | L1 @390x844: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @390x844: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @390x844: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @390x844: The Record table in the Value view renders at least one row. | PASS | 15 row(s) in [data-testid='record-table'] |
| 5 | L5 @390x844: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @390x844: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @390x844: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 8 | L8 @390x844: At 390 pixels wide, no view produces horizontal overflow. | PASS | 6 views checked, no overflow |
| 9 | L9 @390x844: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @390x844: The deployed page declares noindex in the head. | PASS | noindex present in head |

## Run 2026-09-17 11:43Z - https://tessera-assure.netlify.app

**Operation:** ASSURE. **Iteration:** v1.0. **Verdict:** PASS, 36 of 36.

| Line | Check | Result | Detail |
|---|---|---|---|
|  | static: source found | PASS | 98 files |
|  | static: no banned term | PASS |  |
|  | static: no em dash in source | PASS |  |
|  | static: no retired colour | PASS |  |
|  | static: no restricted name present | PASS | 2 restricted names checked, 0 hits |
|  | static: no key value in source | PASS | 0 pattern(s) matched |
|  | static: print stylesheet present in source | PASS | '@media print' found |
|  | driven: definition of done present | PASS | 10 lines |
| 1 | L1 @1920x1080: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1920x1080: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @1920x1080: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @1920x1080: The Record table in the Value view renders at least one row. | PASS | 15 row(s) in [data-testid='record-table'] |
| 5 | L5 @1920x1080: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1920x1080: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1920x1080: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1920x1080: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 1 | L1 @1366x768: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1366x768: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @1366x768: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @1366x768: The Record table in the Value view renders at least one row. | PASS | 15 row(s) in [data-testid='record-table'] |
| 5 | L5 @1366x768: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1366x768: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1366x768: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1366x768: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 1 | L1 @390x844: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @390x844: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @390x844: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @390x844: The Record table in the Value view renders at least one row. | PASS | 15 row(s) in [data-testid='record-table'] |
| 5 | L5 @390x844: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @390x844: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @390x844: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 8 | L8 @390x844: At 390 pixels wide, no view produces horizontal overflow. | PASS | 6 views checked, no overflow |
| 9 | L9 @390x844: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @390x844: The deployed page declares noindex in the head. | PASS | noindex present in head |

## Run 2026-09-17 11:53Z - https://6aabd38fb6fe470710851ac2--tessera-assure.netlify.app

**Operation:** ASSURE. **Iteration:** v1.0. **Verdict:** PASS, 36 of 36.

| Line | Check | Result | Detail |
|---|---|---|---|
|  | static: source found | PASS | 98 files |
|  | static: no banned term | PASS |  |
|  | static: no em dash in source | PASS |  |
|  | static: no retired colour | PASS |  |
|  | static: no restricted name present | PASS | 2 restricted names checked, 0 hits |
|  | static: no key value in source | PASS | 0 pattern(s) matched |
|  | static: print stylesheet present in source | PASS | '@media print' found |
|  | driven: definition of done present | PASS | 10 lines |
| 1 | L1 @1920x1080: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1920x1080: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @1920x1080: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @1920x1080: The Record table in the Value view renders at least one row. | PASS | 15 row(s) in [data-testid='record-table'] |
| 5 | L5 @1920x1080: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1920x1080: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1920x1080: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1920x1080: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 1 | L1 @1366x768: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1366x768: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @1366x768: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @1366x768: The Record table in the Value view renders at least one row. | PASS | 15 row(s) in [data-testid='record-table'] |
| 5 | L5 @1366x768: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1366x768: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1366x768: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1366x768: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 1 | L1 @390x844: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @390x844: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @390x844: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @390x844: The Record table in the Value view renders at least one row. | PASS | 15 row(s) in [data-testid='record-table'] |
| 5 | L5 @390x844: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @390x844: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @390x844: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 8 | L8 @390x844: At 390 pixels wide, no view produces horizontal overflow. | PASS | 6 views checked, no overflow |
| 9 | L9 @390x844: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @390x844: The deployed page declares noindex in the head. | PASS | noindex present in head |

## Run 2026-09-17 11:58Z - https://tessera-assure.netlify.app

**Operation:** ASSURE. **Iteration:** v1.0. **Verdict:** PASS, 36 of 36.

| Line | Check | Result | Detail |
|---|---|---|---|
|  | static: source found | PASS | 98 files |
|  | static: no banned term | PASS |  |
|  | static: no em dash in source | PASS |  |
|  | static: no retired colour | PASS |  |
|  | static: no restricted name present | PASS | 2 restricted names checked, 0 hits |
|  | static: no key value in source | PASS | 0 pattern(s) matched |
|  | static: print stylesheet present in source | PASS | '@media print' found |
|  | driven: definition of done present | PASS | 10 lines |
| 1 | L1 @1920x1080: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1920x1080: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @1920x1080: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @1920x1080: The Record table in the Value view renders at least one row. | PASS | 15 row(s) in [data-testid='record-table'] |
| 5 | L5 @1920x1080: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1920x1080: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1920x1080: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1920x1080: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 1 | L1 @1366x768: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1366x768: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @1366x768: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @1366x768: The Record table in the Value view renders at least one row. | PASS | 15 row(s) in [data-testid='record-table'] |
| 5 | L5 @1366x768: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1366x768: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1366x768: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1366x768: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 1 | L1 @390x844: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @390x844: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @390x844: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @390x844: The Record table in the Value view renders at least one row. | PASS | 15 row(s) in [data-testid='record-table'] |
| 5 | L5 @390x844: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @390x844: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @390x844: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 8 | L8 @390x844: At 390 pixels wide, no view produces horizontal overflow. | PASS | 6 views checked, no overflow |
| 9 | L9 @390x844: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @390x844: The deployed page declares noindex in the head. | PASS | noindex present in head |

## Run 2026-09-17 12:39Z - https://tessera-assure.netlify.app

**Operation:** ASSURE. **Iteration:** v1.0. **Verdict:** PASS, 36 of 36.

| Line | Check | Result | Detail |
|---|---|---|---|
|  | static: source found | PASS | 98 files |
|  | static: no banned term | PASS |  |
|  | static: no em dash in source | PASS |  |
|  | static: no retired colour | PASS |  |
|  | static: no restricted name present | PASS | 2 restricted names checked, 0 hits |
|  | static: no key value in source | PASS | 0 pattern(s) matched |
|  | static: print stylesheet present in source | PASS | '@media print' found |
|  | driven: definition of done present | PASS | 10 lines |
| 1 | L1 @1920x1080: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1920x1080: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @1920x1080: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @1920x1080: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @1920x1080: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1920x1080: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1920x1080: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1920x1080: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 1 | L1 @1366x768: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1366x768: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @1366x768: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @1366x768: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @1366x768: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1366x768: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1366x768: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1366x768: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 1 | L1 @390x844: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @390x844: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @390x844: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @390x844: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @390x844: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @390x844: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @390x844: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 8 | L8 @390x844: At 390 pixels wide, no view produces horizontal overflow. | PASS | 6 views checked, no overflow |
| 9 | L9 @390x844: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @390x844: The deployed page declares noindex in the head. | PASS | noindex present in head |

## Run 2026-09-17 12:48Z - https://tessera-assure.netlify.app

**Operation:** ASSURE. **Iteration:** v1.0. **Verdict:** PASS, 36 of 36.

| Line | Check | Result | Detail |
|---|---|---|---|
|  | static: source found | PASS | 98 files |
|  | static: no banned term | PASS |  |
|  | static: no em dash in source | PASS |  |
|  | static: no retired colour | PASS |  |
|  | static: no restricted name present | PASS | 2 restricted names checked, 0 hits |
|  | static: no key value in source | PASS | 0 pattern(s) matched |
|  | static: print stylesheet present in source | PASS | '@media print' found |
|  | driven: definition of done present | PASS | 10 lines |
| 1 | L1 @1920x1080: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1920x1080: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @1920x1080: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @1920x1080: The Record table in the Value view renders at least one row. | PASS | 21 row(s) in [data-testid='record-table'] |
| 5 | L5 @1920x1080: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1920x1080: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1920x1080: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1920x1080: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 1 | L1 @1366x768: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1366x768: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @1366x768: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @1366x768: The Record table in the Value view renders at least one row. | PASS | 21 row(s) in [data-testid='record-table'] |
| 5 | L5 @1366x768: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1366x768: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1366x768: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1366x768: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 1 | L1 @390x844: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @390x844: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 6 views render a heading |
| 3 | L3 @390x844: Signed in as the operator, every admin view loads and renders a headin | PASS | 9 views render a heading |
| 4 | L4 @390x844: The Record table in the Value view renders at least one row. | PASS | 21 row(s) in [data-testid='record-table'] |
| 5 | L5 @390x844: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @390x844: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @390x844: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 8 | L8 @390x844: At 390 pixels wide, no view produces horizontal overflow. | PASS | 6 views checked, no overflow |
| 9 | L9 @390x844: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @390x844: The deployed page declares noindex in the head. | PASS | noindex present in head |
