
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

## Run 2026-09-17 13:29Z - https://tessera-assure.netlify.app

**Operation:** ASSURE. **Iteration:** v1.0. **Verdict:** FAIL, 28 of 58.

| Line | Check | Result | Detail |
|---|---|---|---|
|  | static: source found | PASS | 115 files |
|  | static: no banned term | FAIL | placeholder |
|  | static: no em dash in source | FAIL | 06_EXECUTION\build\maximus-src\apps\web\src\components\tracker\TaskTable.tsx |
|  | static: no retired colour | PASS |  |
|  | static: no restricted name present | PASS | 2 restricted names checked, 0 hits |
|  | static: no key value in source | PASS | 0 pattern(s) matched |
|  | static: print stylesheet present in source | PASS | '@media print' found |
|  | static: TASK_COLUMNS is What, How, Who, When, Done, Status in order | PASS | matches exactly |
|  | driven: definition of done present | PASS | 17 lines |
| 1 | L1 @1920x1080: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1920x1080: Every client portal view loads and renders a heading: Policy Guide, re | FAIL | failed: tracker:nav-missing |
| 3 | L3 @1920x1080: Signed in as the operator, every admin view loads and renders a headin | FAIL | failed: workplan:nav-missing, procedures:nav-missing |
| 4 | L4 @1920x1080: The Record table in the Value view renders at least one row. | PASS | 21 row(s) in [data-testid='record-table'] |
| 5 | L5 @1920x1080: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1920x1080: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1920x1080: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1920x1080: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @1920x1080: The client's home is the Compliance Tracker and answers the six questi | FAIL | the client tracker view was not reachable |
| 12 | L12 @1920x1080: Every task table shows the six questions, in order, and they are not r | FAIL | client:tracker: view not reachable; client:area: view not reachable; admin:workplan: view not reachable |
| 13 | L13 @1920x1080: No percentage is shown without its fraction beside it. | FAIL | tracker: view not reachable; area: view not reachable |
| 14 | L14 @1920x1080: No illustrative figure is reachable on the client side of the tracker. | FAIL | 'illustrative' found on: tracker: view not reachable, area: view not reachable |
| 15 | L15 @1920x1080: The client can confirm a task assigned to them and can do nothing else | FAIL | the client tracker view was not reachable |
| 16 | L16 @1920x1080: An area page prints as a clean document. | FAIL | no area page reachable |
| 17 | L17 @1920x1080: "No data yet" is a state, not a blank. | FAIL | the client tracker view was not reachable |
| 1 | L1 @1366x768: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1366x768: Every client portal view loads and renders a heading: Policy Guide, re | FAIL | failed: tracker:nav-missing |
| 3 | L3 @1366x768: Signed in as the operator, every admin view loads and renders a headin | FAIL | failed: workplan:nav-missing, procedures:nav-missing |
| 4 | L4 @1366x768: The Record table in the Value view renders at least one row. | PASS | 21 row(s) in [data-testid='record-table'] |
| 5 | L5 @1366x768: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1366x768: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1366x768: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1366x768: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @1366x768: The client's home is the Compliance Tracker and answers the six questi | FAIL | the client tracker view was not reachable |
| 12 | L12 @1366x768: Every task table shows the six questions, in order, and they are not r | FAIL | client:tracker: view not reachable; client:area: view not reachable; admin:workplan: view not reachable |
| 13 | L13 @1366x768: No percentage is shown without its fraction beside it. | FAIL | tracker: view not reachable; area: view not reachable |
| 14 | L14 @1366x768: No illustrative figure is reachable on the client side of the tracker. | FAIL | 'illustrative' found on: tracker: view not reachable, area: view not reachable |
| 15 | L15 @1366x768: The client can confirm a task assigned to them and can do nothing else | FAIL | the client tracker view was not reachable |
| 16 | L16 @1366x768: An area page prints as a clean document. | FAIL | no area page reachable |
| 17 | L17 @1366x768: "No data yet" is a state, not a blank. | FAIL | the client tracker view was not reachable |
| 1 | L1 @390x844: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @390x844: Every client portal view loads and renders a heading: Policy Guide, re | FAIL | failed: tracker:nav-missing |
| 3 | L3 @390x844: Signed in as the operator, every admin view loads and renders a headin | FAIL | failed: workplan:nav-missing, procedures:nav-missing |
| 4 | L4 @390x844: The Record table in the Value view renders at least one row. | PASS | 21 row(s) in [data-testid='record-table'] |
| 5 | L5 @390x844: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @390x844: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @390x844: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 8 | L8 @390x844: At 390 pixels wide, no view produces horizontal overflow. | FAIL | overflow on: tracker:nav-missing, area:nav-missing |
| 9 | L9 @390x844: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @390x844: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @390x844: The client's home is the Compliance Tracker and answers the six questi | FAIL | the client tracker view was not reachable |
| 12 | L12 @390x844: Every task table shows the six questions, in order, and they are not r | FAIL | client:tracker: view not reachable; client:area: view not reachable; admin:workplan: view not reachable |
| 13 | L13 @390x844: No percentage is shown without its fraction beside it. | FAIL | tracker: view not reachable; area: view not reachable |
| 14 | L14 @390x844: No illustrative figure is reachable on the client side of the tracker. | FAIL | 'illustrative' found on: tracker: view not reachable, area: view not reachable |
| 15 | L15 @390x844: The client can confirm a task assigned to them and can do nothing else | FAIL | the client tracker view was not reachable |
| 16 | L16 @390x844: An area page prints as a clean document. | FAIL | no area page reachable |
| 17 | L17 @390x844: "No data yet" is a state, not a blank. | FAIL | the client tracker view was not reachable |

**Failed:**

- static: no banned term: placeholder
- static: no em dash in source: 06_EXECUTION\build\maximus-src\apps\web\src\components\tracker\TaskTable.tsx
- L2 @1920x1080: Every client portal view loads and renders a heading: Policy Guide, re: failed: tracker:nav-missing
- L3 @1920x1080: Signed in as the operator, every admin view loads and renders a headin: failed: workplan:nav-missing, procedures:nav-missing
- L11 @1920x1080: The client's home is the Compliance Tracker and answers the six questi: the client tracker view was not reachable
- L12 @1920x1080: Every task table shows the six questions, in order, and they are not r: client:tracker: view not reachable; client:area: view not reachable; admin:workplan: view not reachable
- L13 @1920x1080: No percentage is shown without its fraction beside it.: tracker: view not reachable; area: view not reachable
- L14 @1920x1080: No illustrative figure is reachable on the client side of the tracker.: 'illustrative' found on: tracker: view not reachable, area: view not reachable
- L15 @1920x1080: The client can confirm a task assigned to them and can do nothing else: the client tracker view was not reachable
- L16 @1920x1080: An area page prints as a clean document.: no area page reachable
- L17 @1920x1080: "No data yet" is a state, not a blank.: the client tracker view was not reachable
- L2 @1366x768: Every client portal view loads and renders a heading: Policy Guide, re: failed: tracker:nav-missing
- L3 @1366x768: Signed in as the operator, every admin view loads and renders a headin: failed: workplan:nav-missing, procedures:nav-missing
- L11 @1366x768: The client's home is the Compliance Tracker and answers the six questi: the client tracker view was not reachable
- L12 @1366x768: Every task table shows the six questions, in order, and they are not r: client:tracker: view not reachable; client:area: view not reachable; admin:workplan: view not reachable
- L13 @1366x768: No percentage is shown without its fraction beside it.: tracker: view not reachable; area: view not reachable
- L14 @1366x768: No illustrative figure is reachable on the client side of the tracker.: 'illustrative' found on: tracker: view not reachable, area: view not reachable
- L15 @1366x768: The client can confirm a task assigned to them and can do nothing else: the client tracker view was not reachable
- L16 @1366x768: An area page prints as a clean document.: no area page reachable
- L17 @1366x768: "No data yet" is a state, not a blank.: the client tracker view was not reachable
- L2 @390x844: Every client portal view loads and renders a heading: Policy Guide, re: failed: tracker:nav-missing
- L3 @390x844: Signed in as the operator, every admin view loads and renders a headin: failed: workplan:nav-missing, procedures:nav-missing
- L8 @390x844: At 390 pixels wide, no view produces horizontal overflow.: overflow on: tracker:nav-missing, area:nav-missing
- L11 @390x844: The client's home is the Compliance Tracker and answers the six questi: the client tracker view was not reachable
- L12 @390x844: Every task table shows the six questions, in order, and they are not r: client:tracker: view not reachable; client:area: view not reachable; admin:workplan: view not reachable
- L13 @390x844: No percentage is shown without its fraction beside it.: tracker: view not reachable; area: view not reachable
- L14 @390x844: No illustrative figure is reachable on the client side of the tracker.: 'illustrative' found on: tracker: view not reachable, area: view not reachable
- L15 @390x844: The client can confirm a task assigned to them and can do nothing else: the client tracker view was not reachable
- L16 @390x844: An area page prints as a clean document.: no area page reachable
- L17 @390x844: "No data yet" is a state, not a blank.: the client tracker view was not reachable

## Run 2026-09-17 13:45Z - https://6aabec64784e0d0ed2174ce4--tessera-assure.netlify.app

**Operation:** ASSURE. **Iteration:** v1.0. **Verdict:** FAIL, 49 of 58.

| Line | Check | Result | Detail |
|---|---|---|---|
|  | static: source found | PASS | 116 files |
|  | static: no banned term | PASS |  |
|  | static: no em dash in source | PASS |  |
|  | static: no retired colour | PASS |  |
|  | static: no restricted name present | PASS | 2 restricted names checked, 0 hits |
|  | static: no key value in source | PASS | 0 pattern(s) matched |
|  | static: print stylesheet present in source | PASS | '@media print' found |
|  | static: TASK_COLUMNS is What, How, Who, When, Done, Status in order | PASS | matches exactly |
|  | driven: definition of done present | PASS | 17 lines |
| 1 | L1 @1920x1080: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1920x1080: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 7 views render a heading |
| 3 | L3 @1920x1080: Signed in as the operator, every admin view loads and renders a headin | PASS | 11 views render a heading |
| 4 | L4 @1920x1080: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @1920x1080: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1920x1080: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1920x1080: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1920x1080: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @1920x1080: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @1920x1080: Every task table shows the six questions, in order, and they are not r | FAIL | client:tracker: [data-testid='task-table'] not found; client:area: [data-testid='task-table'] not found; admin:workplan table[0]: ['AREA', 'PHASE', 'WHAT', 'HOW', 'WHO', 'WHEN', 'DONE', 'STATUS', 'PROGRESS', 'ACTIONS'] |
| 13 | L13 @1920x1080: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @1920x1080: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @1920x1080: The client can confirm a task assigned to them and can do nothing else | FAIL | confirm present; forbidden controls: area[14]: view not reachable; area[15]: view not reachable; area[16]: view not reachable; area[17]: view not reachable; area[18]: view not reachable |
| 16 | L16 @1920x1080: An area page prints as a clean document. | FAIL | chrome visible under print: False, obligation visible: False, task table visible: False |
| 17 | L17 @1920x1080: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 1 | L1 @1366x768: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1366x768: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 7 views render a heading |
| 3 | L3 @1366x768: Signed in as the operator, every admin view loads and renders a headin | PASS | 11 views render a heading |
| 4 | L4 @1366x768: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @1366x768: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1366x768: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1366x768: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1366x768: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @1366x768: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @1366x768: Every task table shows the six questions, in order, and they are not r | FAIL | client:tracker: [data-testid='task-table'] not found; client:area: [data-testid='task-table'] not found; admin:workplan table[0]: ['AREA', 'PHASE', 'WHAT', 'HOW', 'WHO', 'WHEN', 'DONE', 'STATUS', 'PROGRESS', 'ACTIONS'] |
| 13 | L13 @1366x768: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @1366x768: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @1366x768: The client can confirm a task assigned to them and can do nothing else | FAIL | confirm present; forbidden controls: area[1]: view not reachable; area[12]: view not reachable; area[13]: view not reachable |
| 16 | L16 @1366x768: An area page prints as a clean document. | FAIL | chrome visible under print: False, obligation visible: False, task table visible: False |
| 17 | L17 @1366x768: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 1 | L1 @390x844: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @390x844: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 7 views render a heading |
| 3 | L3 @390x844: Signed in as the operator, every admin view loads and renders a headin | PASS | 11 views render a heading |
| 4 | L4 @390x844: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @390x844: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @390x844: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @390x844: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 8 | L8 @390x844: At 390 pixels wide, no view produces horizontal overflow. | PASS | 8 views checked, no overflow |
| 9 | L9 @390x844: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @390x844: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @390x844: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @390x844: Every task table shows the six questions, in order, and they are not r | FAIL | client:tracker: [data-testid='task-table'] not found; client:area: [data-testid='task-table'] not found; admin:workplan table[0]: ['AREA', 'PHASE', 'WHAT', 'HOW', 'WHO', 'WHEN', 'DONE', 'STATUS', 'PROGRESS', 'ACTIONS'] |
| 13 | L13 @390x844: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @390x844: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @390x844: The client can confirm a task assigned to them and can do nothing else | FAIL | confirm present; forbidden controls: area[10]: view not reachable |
| 16 | L16 @390x844: An area page prints as a clean document. | FAIL | chrome visible under print: False, obligation visible: False, task table visible: False |
| 17 | L17 @390x844: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |

**Failed:**

- L12 @1920x1080: Every task table shows the six questions, in order, and they are not r: client:tracker: [data-testid='task-table'] not found; client:area: [data-testid='task-table'] not found; admin:workplan table[0]: ['AREA', 'PHASE', 'WHAT', 'HOW', 'WHO', 'WHEN', 'DONE', 'STATUS', 'PROGRESS', 'ACTIONS']
- L15 @1920x1080: The client can confirm a task assigned to them and can do nothing else: confirm present; forbidden controls: area[14]: view not reachable; area[15]: view not reachable; area[16]: view not reachable; area[17]: view not reachable; area[18]: view not reachable
- L16 @1920x1080: An area page prints as a clean document.: chrome visible under print: False, obligation visible: False, task table visible: False
- L12 @1366x768: Every task table shows the six questions, in order, and they are not r: client:tracker: [data-testid='task-table'] not found; client:area: [data-testid='task-table'] not found; admin:workplan table[0]: ['AREA', 'PHASE', 'WHAT', 'HOW', 'WHO', 'WHEN', 'DONE', 'STATUS', 'PROGRESS', 'ACTIONS']
- L15 @1366x768: The client can confirm a task assigned to them and can do nothing else: confirm present; forbidden controls: area[1]: view not reachable; area[12]: view not reachable; area[13]: view not reachable
- L16 @1366x768: An area page prints as a clean document.: chrome visible under print: False, obligation visible: False, task table visible: False
- L12 @390x844: Every task table shows the six questions, in order, and they are not r: client:tracker: [data-testid='task-table'] not found; client:area: [data-testid='task-table'] not found; admin:workplan table[0]: ['AREA', 'PHASE', 'WHAT', 'HOW', 'WHO', 'WHEN', 'DONE', 'STATUS', 'PROGRESS', 'ACTIONS']
- L15 @390x844: The client can confirm a task assigned to them and can do nothing else: confirm present; forbidden controls: area[10]: view not reachable
- L16 @390x844: An area page prints as a clean document.: chrome visible under print: False, obligation visible: False, task table visible: False

## Run 2026-09-17 13:54Z - https://6aabec64784e0d0ed2174ce4--tessera-assure.netlify.app

**Operation:** ASSURE. **Iteration:** v1.0. **Verdict:** PASS, 58 of 58.

| Line | Check | Result | Detail |
|---|---|---|---|
|  | static: source found | PASS | 116 files |
|  | static: no banned term | PASS |  |
|  | static: no em dash in source | PASS |  |
|  | static: no retired colour | PASS |  |
|  | static: no restricted name present | PASS | 2 restricted names checked, 0 hits |
|  | static: no key value in source | PASS | 0 pattern(s) matched |
|  | static: print stylesheet present in source | PASS | '@media print' found |
|  | static: TASK_COLUMNS is What, How, Who, When, Done, Status in order | PASS | matches exactly |
|  | driven: definition of done present | PASS | 17 lines |
| 1 | L1 @1920x1080: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1920x1080: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 7 views render a heading |
| 3 | L3 @1920x1080: Signed in as the operator, every admin view loads and renders a headin | PASS | 11 views render a heading |
| 4 | L4 @1920x1080: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @1920x1080: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1920x1080: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1920x1080: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1920x1080: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @1920x1080: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @1920x1080: Every task table shows the six questions, in order, and they are not r | PASS | 2 task table(s) carry the six questions in order |
| 13 | L13 @1920x1080: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @1920x1080: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @1920x1080: The client can confirm a task assigned to them and can do nothing else | PASS | confirm control present; no edit/delete/reprioritise control found |
| 16 | L16 @1920x1080: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, task table visible: True |
| 17 | L17 @1920x1080: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 1 | L1 @1366x768: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1366x768: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 7 views render a heading |
| 3 | L3 @1366x768: Signed in as the operator, every admin view loads and renders a headin | PASS | 11 views render a heading |
| 4 | L4 @1366x768: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @1366x768: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1366x768: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1366x768: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1366x768: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @1366x768: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @1366x768: Every task table shows the six questions, in order, and they are not r | PASS | 2 task table(s) carry the six questions in order |
| 13 | L13 @1366x768: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @1366x768: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @1366x768: The client can confirm a task assigned to them and can do nothing else | PASS | confirm control present; no edit/delete/reprioritise control found |
| 16 | L16 @1366x768: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, task table visible: True |
| 17 | L17 @1366x768: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 1 | L1 @390x844: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @390x844: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 7 views render a heading |
| 3 | L3 @390x844: Signed in as the operator, every admin view loads and renders a headin | PASS | 11 views render a heading |
| 4 | L4 @390x844: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @390x844: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @390x844: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @390x844: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 8 | L8 @390x844: At 390 pixels wide, no view produces horizontal overflow. | PASS | 8 views checked, no overflow |
| 9 | L9 @390x844: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @390x844: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @390x844: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @390x844: Every task table shows the six questions, in order, and they are not r | PASS | 2 task table(s) carry the six questions in order |
| 13 | L13 @390x844: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @390x844: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @390x844: The client can confirm a task assigned to them and can do nothing else | PASS | confirm control present; no edit/delete/reprioritise control found |
| 16 | L16 @390x844: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, task table visible: True |
| 17 | L17 @390x844: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |

## Run 2026-09-17 14:02Z - https://tessera-assure.netlify.app

**Operation:** ASSURE. **Iteration:** v1.1. **Verdict:** PASS, 58 of 58.

| Line | Check | Result | Detail |
|---|---|---|---|
|  | static: source found | PASS | 116 files |
|  | static: no banned term | PASS |  |
|  | static: no em dash in source | PASS |  |
|  | static: no retired colour | PASS |  |
|  | static: no restricted name present | PASS | 2 restricted names checked, 0 hits |
|  | static: no key value in source | PASS | 0 pattern(s) matched |
|  | static: print stylesheet present in source | PASS | '@media print' found |
|  | static: TASK_COLUMNS is What, How, Who, When, Done, Status in order | PASS | matches exactly |
|  | driven: definition of done present | PASS | 17 lines |
| 1 | L1 @1920x1080: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1920x1080: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 7 views render a heading |
| 3 | L3 @1920x1080: Signed in as the operator, every admin view loads and renders a headin | PASS | 11 views render a heading |
| 4 | L4 @1920x1080: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @1920x1080: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1920x1080: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1920x1080: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1920x1080: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @1920x1080: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @1920x1080: Every task table shows the six questions, in order, and they are not r | PASS | 2 task table(s) carry the six questions in order |
| 13 | L13 @1920x1080: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @1920x1080: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @1920x1080: The client can confirm a task assigned to them and can do nothing else | PASS | confirm control present; no edit/delete/reprioritise control found |
| 16 | L16 @1920x1080: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, task table visible: True |
| 17 | L17 @1920x1080: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 1 | L1 @1366x768: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1366x768: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 7 views render a heading |
| 3 | L3 @1366x768: Signed in as the operator, every admin view loads and renders a headin | PASS | 11 views render a heading |
| 4 | L4 @1366x768: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @1366x768: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1366x768: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1366x768: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1366x768: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @1366x768: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @1366x768: Every task table shows the six questions, in order, and they are not r | PASS | 2 task table(s) carry the six questions in order |
| 13 | L13 @1366x768: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @1366x768: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @1366x768: The client can confirm a task assigned to them and can do nothing else | PASS | confirm control present; no edit/delete/reprioritise control found |
| 16 | L16 @1366x768: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, task table visible: True |
| 17 | L17 @1366x768: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 1 | L1 @390x844: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @390x844: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 7 views render a heading |
| 3 | L3 @390x844: Signed in as the operator, every admin view loads and renders a headin | PASS | 11 views render a heading |
| 4 | L4 @390x844: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @390x844: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @390x844: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @390x844: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 8 | L8 @390x844: At 390 pixels wide, no view produces horizontal overflow. | PASS | 8 views checked, no overflow |
| 9 | L9 @390x844: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @390x844: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @390x844: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @390x844: Every task table shows the six questions, in order, and they are not r | PASS | 2 task table(s) carry the six questions in order |
| 13 | L13 @390x844: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @390x844: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @390x844: The client can confirm a task assigned to them and can do nothing else | PASS | confirm control present; no edit/delete/reprioritise control found |
| 16 | L16 @390x844: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, task table visible: True |
| 17 | L17 @390x844: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |

## Run 2026-09-17 14:17Z - https://tessera-assure.netlify.app

**Operation:** ASSURE. **Iteration:** v1.1. **Verdict:** PASS, 58 of 58.

| Line | Check | Result | Detail |
|---|---|---|---|
|  | static: source found | PASS | 116 files |
|  | static: no banned term | PASS |  |
|  | static: no em dash in source | PASS |  |
|  | static: no retired colour | PASS |  |
|  | static: no restricted name present | PASS | 2 restricted names checked, 0 hits |
|  | static: no key value in source | PASS | 0 pattern(s) matched |
|  | static: print stylesheet present in source | PASS | '@media print' found |
|  | static: TASK_COLUMNS is What, How, Who, When, Done, Status in order | PASS | matches exactly |
|  | driven: definition of done present | PASS | 17 lines |
| 1 | L1 @1920x1080: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1920x1080: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 7 views render a heading |
| 3 | L3 @1920x1080: Signed in as the operator, every admin view loads and renders a headin | PASS | 11 views render a heading |
| 4 | L4 @1920x1080: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @1920x1080: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1920x1080: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1920x1080: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1920x1080: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @1920x1080: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @1920x1080: Every task table shows the six questions, in order, and they are not r | PASS | 2 task table(s) carry the six questions in order |
| 13 | L13 @1920x1080: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @1920x1080: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @1920x1080: The client can confirm a task assigned to them and can do nothing else | PASS | confirm control present; no edit/delete/reprioritise control found |
| 16 | L16 @1920x1080: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, task table visible: True |
| 17 | L17 @1920x1080: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 1 | L1 @1366x768: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1366x768: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 7 views render a heading |
| 3 | L3 @1366x768: Signed in as the operator, every admin view loads and renders a headin | PASS | 11 views render a heading |
| 4 | L4 @1366x768: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @1366x768: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1366x768: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1366x768: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1366x768: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @1366x768: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @1366x768: Every task table shows the six questions, in order, and they are not r | PASS | 2 task table(s) carry the six questions in order |
| 13 | L13 @1366x768: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @1366x768: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @1366x768: The client can confirm a task assigned to them and can do nothing else | PASS | confirm control present; no edit/delete/reprioritise control found |
| 16 | L16 @1366x768: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, task table visible: True |
| 17 | L17 @1366x768: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 1 | L1 @390x844: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @390x844: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 7 views render a heading |
| 3 | L3 @390x844: Signed in as the operator, every admin view loads and renders a headin | PASS | 11 views render a heading |
| 4 | L4 @390x844: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @390x844: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @390x844: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @390x844: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 8 | L8 @390x844: At 390 pixels wide, no view produces horizontal overflow. | PASS | 8 views checked, no overflow |
| 9 | L9 @390x844: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @390x844: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @390x844: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @390x844: Every task table shows the six questions, in order, and they are not r | PASS | 2 task table(s) carry the six questions in order |
| 13 | L13 @390x844: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @390x844: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @390x844: The client can confirm a task assigned to them and can do nothing else | PASS | confirm control present; no edit/delete/reprioritise control found |
| 16 | L16 @390x844: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, task table visible: True |
| 17 | L17 @390x844: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |

## Run 2026-09-17 14:27Z - https://tessera-assure.netlify.app

**Operation:** ASSURE. **Iteration:** v1.1. **Verdict:** PASS, 58 of 58.

| Line | Check | Result | Detail |
|---|---|---|---|
|  | static: source found | PASS | 116 files |
|  | static: no banned term | PASS |  |
|  | static: no em dash in source | PASS |  |
|  | static: no retired colour | PASS |  |
|  | static: no restricted name present | PASS | 2 restricted names checked, 0 hits |
|  | static: no key value in source | PASS | 0 pattern(s) matched |
|  | static: print stylesheet present in source | PASS | '@media print' found |
|  | static: TASK_COLUMNS is What, How, Who, When, Done, Status in order | PASS | matches exactly |
|  | driven: definition of done present | PASS | 17 lines |
| 1 | L1 @1920x1080: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1920x1080: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 7 views render a heading |
| 3 | L3 @1920x1080: Signed in as the operator, every admin view loads and renders a headin | PASS | 11 views render a heading |
| 4 | L4 @1920x1080: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @1920x1080: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1920x1080: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1920x1080: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1920x1080: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @1920x1080: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @1920x1080: Every task table shows the six questions, in order, and they are not r | PASS | 2 task table(s) carry the six questions in order |
| 13 | L13 @1920x1080: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @1920x1080: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @1920x1080: The client can confirm a task assigned to them and can do nothing else | PASS | confirm control present; no edit/delete/reprioritise control found |
| 16 | L16 @1920x1080: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, task table visible: True |
| 17 | L17 @1920x1080: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 1 | L1 @1366x768: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @1366x768: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 7 views render a heading |
| 3 | L3 @1366x768: Signed in as the operator, every admin view loads and renders a headin | PASS | 11 views render a heading |
| 4 | L4 @1366x768: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @1366x768: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1366x768: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1366x768: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1366x768: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @1366x768: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @1366x768: Every task table shows the six questions, in order, and they are not r | PASS | 2 task table(s) carry the six questions in order |
| 13 | L13 @1366x768: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @1366x768: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @1366x768: The client can confirm a task assigned to them and can do nothing else | PASS | confirm control present; no edit/delete/reprioritise control found |
| 16 | L16 @1366x768: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, task table visible: True |
| 17 | L17 @1366x768: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 1 | L1 @390x844: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='guide'] present |
| 2 | L2 @390x844: Every client portal view loads and renders a heading: Policy Guide, re | PASS | 7 views render a heading |
| 3 | L3 @390x844: Signed in as the operator, every admin view loads and renders a headin | PASS | 11 views render a heading |
| 4 | L4 @390x844: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @390x844: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @390x844: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @390x844: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 8 | L8 @390x844: At 390 pixels wide, no view produces horizontal overflow. | PASS | 8 views checked, no overflow |
| 9 | L9 @390x844: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @390x844: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @390x844: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @390x844: Every task table shows the six questions, in order, and they are not r | PASS | 2 task table(s) carry the six questions in order |
| 13 | L13 @390x844: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @390x844: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @390x844: The client can confirm a task assigned to them and can do nothing else | PASS | confirm control present; no edit/delete/reprioritise control found |
| 16 | L16 @390x844: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, task table visible: True |
| 17 | L17 @390x844: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
