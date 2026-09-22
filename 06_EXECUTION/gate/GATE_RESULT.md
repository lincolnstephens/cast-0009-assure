
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

## Run 2026-09-22 09:29Z - https://tessera-assure.netlify.app

**Operation:** ASSURE. **Iteration:** v1.2. **Verdict:** FAIL, 50 of 75.

| Line | Check | Result | Detail |
|---|---|---|---|
|  | static: source found | PASS | 121 files |
|  | static: no banned term | PASS |  |
|  | static: no em dash in source | PASS |  |
|  | static: no retired colour | PASS |  |
|  | static: no restricted name present | PASS | 2 restricted names checked, 0 hits |
|  | static: no key value in source | PASS | 0 pattern(s) matched |
|  | static: print stylesheet present in source | PASS | '@media print' found |
|  | static: TASK_COLUMNS is What, How, Who, When, Done, Status in order | PASS | matches exactly |
|  | static: the eight module names match FRAGO 02 section 3, in order | PASS | matches exactly |
|  | static: no file write outside documents.ts and the Blobs store | PASS | no hits |
|  | driven: definition of done present | PASS | 22 lines |
| 1 | L1 @1920x1080: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='tracker'] present |
| 2 | L2 @1920x1080: Every client portal view loads and renders a heading: Compliance Track | FAIL | failed: documents:nav-missing, jobs:nav-missing |
| 3 | L3 @1920x1080: Signed in as the operator, every admin view loads and renders a headin | FAIL | failed: documents-admin:nav-missing, jobs-admin:nav-missing |
| 4 | L4 @1920x1080: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @1920x1080: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1920x1080: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1920x1080: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1920x1080: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @1920x1080: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @1920x1080: Every task table shows the six questions, in order, and they are not r | FAIL | client:jobs: view not reachable |
| 13 | L13 @1920x1080: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @1920x1080: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @1920x1080: The client can confirm a task assigned to them and can do nothing else | FAIL | confirm present; forbidden controls: jobs: view not reachable; documents: view not reachable |
| 16 | L16 @1920x1080: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, task table visible: True |
| 17 | L17 @1920x1080: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 18 | L18 @1920x1080: The client's navigation is Lurong's, in her order. | FAIL | expected ['tracker', 'documents', 'jobs', 'request', 'value', 'statement'], got ['tracker', 'guide', 'request', 'value', 'statement', 'posture', 'exposure'] |
| 19 | L19 @1920x1080: The eight modules carry their v1.2 titles. | FAIL | [data-testid='area-tile-name'] not found; [data-testid='module-nav-item'] not found |
| 20 | L20 @1920x1080: Compliance Documents shows the three sections and the client cannot wr | FAIL | the client documents view was not reachable |
| 21 | L21 @1920x1080: Jobs shows every task in the three groups with the six questions. | FAIL | the client jobs view was not reachable |
| 22 | L22 @1920x1080: The overall figure says where the client stands. | PASS | standing phrase present: True; percentage present: True, fraction present: True |
| 1 | L1 @1366x768: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='tracker'] present |
| 2 | L2 @1366x768: Every client portal view loads and renders a heading: Compliance Track | FAIL | failed: documents:nav-missing, jobs:nav-missing |
| 3 | L3 @1366x768: Signed in as the operator, every admin view loads and renders a headin | FAIL | failed: documents-admin:nav-missing, jobs-admin:nav-missing |
| 4 | L4 @1366x768: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @1366x768: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1366x768: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1366x768: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1366x768: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @1366x768: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @1366x768: Every task table shows the six questions, in order, and they are not r | FAIL | client:jobs: view not reachable |
| 13 | L13 @1366x768: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @1366x768: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @1366x768: The client can confirm a task assigned to them and can do nothing else | FAIL | confirm present; forbidden controls: area[1]: 'WhatReview the employee access tracker: who can reach what personal data, and whether they still need to.HowMITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.WhoMITMARKWhen21 Oct 2026DoneNot yetStatusOn trackNot started'; area[1]: 'WhatReview the employee access tracker: who can reach what personal data, and whether they still need to.HowMITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.WhoMITMARKWhen21 Jan 2027DoneNot yetStatusOn trackNot started'; area[1]: 'WhatReview the employee access tracker: who can reach what personal data, and whether they still need to.HowMITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.WhoMITMARKWhen21 Apr 2027DoneNot yetStatusOn trackNot started'; area[1]: 'WhatReview the employee access tracker: who can reach what personal data, and whether they still need to.HowMITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.WhoMITMARKWhen21 Jul 2027DoneNot yetStatusOn trackNot started'; jobs: view not reachable; documents: view not reachable |
| 16 | L16 @1366x768: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, task table visible: True |
| 17 | L17 @1366x768: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 18 | L18 @1366x768: The client's navigation is Lurong's, in her order. | FAIL | expected ['tracker', 'documents', 'jobs', 'request', 'value', 'statement'], got ['tracker', 'guide', 'request', 'value', 'statement', 'posture', 'exposure'] |
| 19 | L19 @1366x768: The eight modules carry their v1.2 titles. | FAIL | [data-testid='area-tile-name'] not found; [data-testid='module-nav-item'] not found |
| 20 | L20 @1366x768: Compliance Documents shows the three sections and the client cannot wr | FAIL | the client documents view was not reachable |
| 21 | L21 @1366x768: Jobs shows every task in the three groups with the six questions. | FAIL | the client jobs view was not reachable |
| 22 | L22 @1366x768: The overall figure says where the client stands. | PASS | standing phrase present: True; percentage present: True, fraction present: True |
| 1 | L1 @390x844: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='tracker'] present |
| 2 | L2 @390x844: Every client portal view loads and renders a heading: Compliance Track | FAIL | failed: documents:nav-missing, jobs:nav-missing |
| 3 | L3 @390x844: Signed in as the operator, every admin view loads and renders a headin | FAIL | failed: documents-admin:nav-missing, jobs-admin:nav-missing |
| 4 | L4 @390x844: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @390x844: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @390x844: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @390x844: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 8 | L8 @390x844: At 390 pixels wide, no view produces horizontal overflow, including th | FAIL | overflow on: documents:nav-missing, jobs:nav-missing |
| 9 | L9 @390x844: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @390x844: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @390x844: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @390x844: Every task table shows the six questions, in order, and they are not r | FAIL | client:area: [data-testid='task-table'] not found; client:jobs: view not reachable |
| 13 | L13 @390x844: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @390x844: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @390x844: The client can confirm a task assigned to them and can do nothing else | FAIL | confirm present; forbidden controls: area[1]: 'WHAT

Review the employee access tracker: who can reach what personal data, and whether they still need to.

HOW

MITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.

WHO

MITMARK

WHEN

21 Oct 2026

DONE

Not yet

STATUS

ON TRACK
Not started'; area[1]: 'WHAT

Review the employee access tracker: who can reach what personal data, and whether they still need to.

HOW

MITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.

WHO

MITMARK

WHEN

21 Jan 2027

DONE

Not yet

STATUS

ON TRACK
Not started'; area[1]: 'WHAT

Review the employee access tracker: who can reach what personal data, and whether they still need to.

HOW

MITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.

WHO

MITMARK

WHEN

21 Apr 2027

DONE

Not yet

STATUS

ON TRACK
Not started'; area[1]: 'WHAT

Review the employee access tracker: who can reach what personal data, and whether they still need to.

HOW

MITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.

WHO

MITMARK

WHEN

21 Jul 2027

DONE

Not yet

STATUS

ON TRACK
Not started'; jobs: view not reachable; documents: view not reachable |
| 16 | L16 @390x844: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, task table visible: True |
| 17 | L17 @390x844: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 18 | L18 @390x844: The client's navigation is Lurong's, in her order. | FAIL | expected ['tracker', 'documents', 'jobs', 'request', 'value', 'statement'], got ['tracker', 'guide', 'request', 'value', 'statement', 'posture', 'exposure'] |
| 19 | L19 @390x844: The eight modules carry their v1.2 titles. | FAIL | [data-testid='area-tile-name'] not found; [data-testid='module-nav-item'] not found |
| 20 | L20 @390x844: Compliance Documents shows the three sections and the client cannot wr | FAIL | the client documents view was not reachable |
| 21 | L21 @390x844: Jobs shows every task in the three groups with the six questions. | FAIL | the client jobs view was not reachable |
| 22 | L22 @390x844: The overall figure says where the client stands. | PASS | standing phrase present: True; percentage present: True, fraction present: True |

**Failed:**

- L2 @1920x1080: Every client portal view loads and renders a heading: Compliance Track: failed: documents:nav-missing, jobs:nav-missing
- L3 @1920x1080: Signed in as the operator, every admin view loads and renders a headin: failed: documents-admin:nav-missing, jobs-admin:nav-missing
- L12 @1920x1080: Every task table shows the six questions, in order, and they are not r: client:jobs: view not reachable
- L15 @1920x1080: The client can confirm a task assigned to them and can do nothing else: confirm present; forbidden controls: jobs: view not reachable; documents: view not reachable
- L18 @1920x1080: The client's navigation is Lurong's, in her order.: expected ['tracker', 'documents', 'jobs', 'request', 'value', 'statement'], got ['tracker', 'guide', 'request', 'value', 'statement', 'posture', 'exposure']
- L19 @1920x1080: The eight modules carry their v1.2 titles.: [data-testid='area-tile-name'] not found; [data-testid='module-nav-item'] not found
- L20 @1920x1080: Compliance Documents shows the three sections and the client cannot wr: the client documents view was not reachable
- L21 @1920x1080: Jobs shows every task in the three groups with the six questions.: the client jobs view was not reachable
- L2 @1366x768: Every client portal view loads and renders a heading: Compliance Track: failed: documents:nav-missing, jobs:nav-missing
- L3 @1366x768: Signed in as the operator, every admin view loads and renders a headin: failed: documents-admin:nav-missing, jobs-admin:nav-missing
- L12 @1366x768: Every task table shows the six questions, in order, and they are not r: client:jobs: view not reachable
- L15 @1366x768: The client can confirm a task assigned to them and can do nothing else: confirm present; forbidden controls: area[1]: 'WhatReview the employee access tracker: who can reach what personal data, and whether they still need to.HowMITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.WhoMITMARKWhen21 Oct 2026DoneNot yetStatusOn trackNot started'; area[1]: 'WhatReview the employee access tracker: who can reach what personal data, and whether they still need to.HowMITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.WhoMITMARKWhen21 Jan 2027DoneNot yetStatusOn trackNot started'; area[1]: 'WhatReview the employee access tracker: who can reach what personal data, and whether they still need to.HowMITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.WhoMITMARKWhen21 Apr 2027DoneNot yetStatusOn trackNot started'; area[1]: 'WhatReview the employee access tracker: who can reach what personal data, and whether they still need to.HowMITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.WhoMITMARKWhen21 Jul 2027DoneNot yetStatusOn trackNot started'; jobs: view not reachable; documents: view not reachable
- L18 @1366x768: The client's navigation is Lurong's, in her order.: expected ['tracker', 'documents', 'jobs', 'request', 'value', 'statement'], got ['tracker', 'guide', 'request', 'value', 'statement', 'posture', 'exposure']
- L19 @1366x768: The eight modules carry their v1.2 titles.: [data-testid='area-tile-name'] not found; [data-testid='module-nav-item'] not found
- L20 @1366x768: Compliance Documents shows the three sections and the client cannot wr: the client documents view was not reachable
- L21 @1366x768: Jobs shows every task in the three groups with the six questions.: the client jobs view was not reachable
- L2 @390x844: Every client portal view loads and renders a heading: Compliance Track: failed: documents:nav-missing, jobs:nav-missing
- L3 @390x844: Signed in as the operator, every admin view loads and renders a headin: failed: documents-admin:nav-missing, jobs-admin:nav-missing
- L8 @390x844: At 390 pixels wide, no view produces horizontal overflow, including th: overflow on: documents:nav-missing, jobs:nav-missing
- L12 @390x844: Every task table shows the six questions, in order, and they are not r: client:area: [data-testid='task-table'] not found; client:jobs: view not reachable
- L15 @390x844: The client can confirm a task assigned to them and can do nothing else: confirm present; forbidden controls: area[1]: 'WHAT

Review the employee access tracker: who can reach what personal data, and whether they still need to.

HOW

MITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.

WHO

MITMARK

WHEN

21 Oct 2026

DONE

Not yet

STATUS

ON TRACK
Not started'; area[1]: 'WHAT

Review the employee access tracker: who can reach what personal data, and whether they still need to.

HOW

MITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.

WHO

MITMARK

WHEN

21 Jan 2027

DONE

Not yet

STATUS

ON TRACK
Not started'; area[1]: 'WHAT

Review the employee access tracker: who can reach what personal data, and whether they still need to.

HOW

MITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.

WHO

MITMARK

WHEN

21 Apr 2027

DONE

Not yet

STATUS

ON TRACK
Not started'; area[1]: 'WHAT

Review the employee access tracker: who can reach what personal data, and whether they still need to.

HOW

MITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.

WHO

MITMARK

WHEN

21 Jul 2027

DONE

Not yet

STATUS

ON TRACK
Not started'; jobs: view not reachable; documents: view not reachable
- L18 @390x844: The client's navigation is Lurong's, in her order.: expected ['tracker', 'documents', 'jobs', 'request', 'value', 'statement'], got ['tracker', 'guide', 'request', 'value', 'statement', 'posture', 'exposure']
- L19 @390x844: The eight modules carry their v1.2 titles.: [data-testid='area-tile-name'] not found; [data-testid='module-nav-item'] not found
- L20 @390x844: Compliance Documents shows the three sections and the client cannot wr: the client documents view was not reachable
- L21 @390x844: Jobs shows every task in the three groups with the six questions.: the client jobs view was not reachable

## Run 2026-09-22 09:38Z - https://6ab24a32a5466b9b50484f46--tessera-assure.netlify.app

**Operation:** ASSURE. **Iteration:** v1.2. **Verdict:** FAIL, 62 of 75.

| Line | Check | Result | Detail |
|---|---|---|---|
|  | static: source found | PASS | 122 files |
|  | static: no banned term | PASS |  |
|  | static: no em dash in source | PASS |  |
|  | static: no retired colour | PASS |  |
|  | static: no restricted name present | PASS | 2 restricted names checked, 0 hits |
|  | static: no key value in source | PASS | 0 pattern(s) matched |
|  | static: print stylesheet present in source | PASS | '@media print' found |
|  | static: TASK_COLUMNS is What, How, Who, When, Done, Status in order | PASS | matches exactly |
|  | static: the eight module names match FRAGO 02 section 3, in order | PASS | matches exactly |
|  | static: no file write outside documents.ts and the Blobs store | PASS | no hits |
|  | driven: definition of done present | PASS | 22 lines |
| 1 | L1 @1920x1080: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='tracker'] present |
| 2 | L2 @1920x1080: Every client portal view loads and renders a heading: Compliance Track | PASS | 6 views render a heading |
| 3 | L3 @1920x1080: Signed in as the operator, every admin view loads and renders a headin | PASS | 13 views render a heading |
| 4 | L4 @1920x1080: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @1920x1080: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1920x1080: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1920x1080: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1920x1080: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @1920x1080: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @1920x1080: Every task table shows the six questions, in order, and they are not r | FAIL | client:area: [data-testid='task-table'] not found; client:jobs table[1]: no header cells |
| 13 | L13 @1920x1080: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @1920x1080: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @1920x1080: The client can confirm a task assigned to them and can do nothing else | FAIL | confirm present; forbidden controls: area[1]: 'WhatReview the employee access tracker: who can reach what personal data, and whether they still need to.HowMITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.WhoMITMARKWhen21 Oct 2026DoneNot yetStatusOn trackNot started'; area[1]: 'WhatReview the employee access tracker: who can reach what personal data, and whether they still need to.HowMITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.WhoMITMARKWhen21 Jan 2027DoneNot yetStatusOn trackNot started'; area[1]: 'WhatReview the employee access tracker: who can reach what personal data, and whether they still need to.HowMITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.WhoMITMARKWhen21 Apr 2027DoneNot yetStatusOn trackNot started'; area[1]: 'WhatReview the employee access tracker: who can reach what personal data, and whether they still need to.HowMITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.WhoMITMARKWhen21 Jul 2027DoneNot yetStatusOn trackNot started' |
| 16 | L16 @1920x1080: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, task table visible: True |
| 17 | L17 @1920x1080: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 18 | L18 @1920x1080: The client's navigation is Lurong's, in her order. | PASS | nav reads ['tracker', 'documents', 'jobs', 'request', 'value', 'statement'], in order, with none of ['posture', 'exposure'] |
| 19 | L19 @1920x1080: The eight modules carry their v1.2 titles. | FAIL | [data-testid='area-tile-name'] not found; sub-nav reads ['1. DPO registration', '2. Data tracker review', '3. Data retention', '4. Policy review', '5. Data protection impact assessment', '6. Data subject requests', '7. Vendor data risk', '8. Data breach and incident management'] |
| 20 | L20 @1920x1080: Compliance Documents shows the three sections and the client cannot wr | PASS | three sections present, no upload input, no write control |
| 21 | L21 @1920x1080: Jobs shows every task in the three groups with the six questions. | FAIL | group heading missing: 'Not started'; group heading missing: 'In progress'; group heading missing: 'Completed'; table[1] columns read [] |
| 22 | L22 @1920x1080: The overall figure says where the client stands. | PASS | standing phrase present: True; percentage present: True, fraction present: True |
| 1 | L1 @1366x768: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='tracker'] present |
| 2 | L2 @1366x768: Every client portal view loads and renders a heading: Compliance Track | PASS | 6 views render a heading |
| 3 | L3 @1366x768: Signed in as the operator, every admin view loads and renders a headin | PASS | 13 views render a heading |
| 4 | L4 @1366x768: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @1366x768: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1366x768: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1366x768: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1366x768: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @1366x768: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @1366x768: Every task table shows the six questions, in order, and they are not r | FAIL | client:area: [data-testid='task-table'] not found; client:jobs table[1]: no header cells |
| 13 | L13 @1366x768: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @1366x768: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @1366x768: The client can confirm a task assigned to them and can do nothing else | PASS | confirm control present; no edit/delete/reprioritise control found |
| 16 | L16 @1366x768: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, task table visible: True |
| 17 | L17 @1366x768: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 18 | L18 @1366x768: The client's navigation is Lurong's, in her order. | PASS | nav reads ['tracker', 'documents', 'jobs', 'request', 'value', 'statement'], in order, with none of ['posture', 'exposure'] |
| 19 | L19 @1366x768: The eight modules carry their v1.2 titles. | FAIL | [data-testid='area-tile-name'] not found; sub-nav reads ['1. DPO registration', '2. Data tracker review', '3. Data retention', '4. Policy review', '5. Data protection impact assessment', '6. Data subject requests', '7. Vendor data risk', '8. Data breach and incident management'] |
| 20 | L20 @1366x768: Compliance Documents shows the three sections and the client cannot wr | PASS | three sections present, no upload input, no write control |
| 21 | L21 @1366x768: Jobs shows every task in the three groups with the six questions. | FAIL | group heading missing: 'Not started'; group heading missing: 'In progress'; group heading missing: 'Completed'; table[1] columns read [] |
| 22 | L22 @1366x768: The overall figure says where the client stands. | PASS | standing phrase present: True; percentage present: True, fraction present: True |
| 1 | L1 @390x844: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='tracker'] present |
| 2 | L2 @390x844: Every client portal view loads and renders a heading: Compliance Track | PASS | 6 views render a heading |
| 3 | L3 @390x844: Signed in as the operator, every admin view loads and renders a headin | PASS | 13 views render a heading |
| 4 | L4 @390x844: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @390x844: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @390x844: With the operator's show illustrative switch off, no illustrative entr | FAIL | the operator's settings view was not reachable |
| 7 | L7 @390x844: Print output hides the header and navigation and shows the Statement. | FAIL | chrome visible under print: False, statement visible under print: False |
| 8 | L8 @390x844: At 390 pixels wide, no view produces horizontal overflow, including th | PASS | 7 views checked, no overflow |
| 9 | L9 @390x844: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @390x844: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @390x844: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @390x844: Every task table shows the six questions, in order, and they are not r | FAIL | client:jobs table[1]: no header cells |
| 13 | L13 @390x844: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @390x844: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @390x844: The client can confirm a task assigned to them and can do nothing else | FAIL | confirm present; forbidden controls: area[1]: 'WHAT

Review the employee access tracker: who can reach what personal data, and whether they still need to.

HOW

MITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.

WHO

MITMARK

WHEN

21 Oct 2026

DONE

Not yet

STATUS

ON TRACK
Not started'; area[1]: 'WHAT

Review the employee access tracker: who can reach what personal data, and whether they still need to.

HOW

MITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.

WHO

MITMARK

WHEN

21 Jan 2027

DONE

Not yet

STATUS

ON TRACK
Not started'; area[1]: 'WHAT

Review the employee access tracker: who can reach what personal data, and whether they still need to.

HOW

MITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.

WHO

MITMARK

WHEN

21 Apr 2027

DONE

Not yet

STATUS

ON TRACK
Not started'; area[1]: 'WHAT

Review the employee access tracker: who can reach what personal data, and whether they still need to.

HOW

MITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.

WHO

MITMARK

WHEN

21 Jul 2027

DONE

Not yet

STATUS

ON TRACK
Not started' |
| 16 | L16 @390x844: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, task table visible: True |
| 17 | L17 @390x844: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 18 | L18 @390x844: The client's navigation is Lurong's, in her order. | PASS | nav reads ['tracker', 'documents', 'jobs', 'request', 'value', 'statement'], in order, with none of ['posture', 'exposure'] |
| 19 | L19 @390x844: The eight modules carry their v1.2 titles. | FAIL | [data-testid='area-tile-name'] not found; sub-nav reads ['1. DPO registration', '2. Data tracker review', '3. Data retention', '4. Policy review', '5. Data protection impact assessment', '6. Data subject requests', '7. Vendor data risk', '8. Data breach and incident management'] |
| 20 | L20 @390x844: Compliance Documents shows the three sections and the client cannot wr | PASS | three sections present, no upload input, no write control |
| 21 | L21 @390x844: Jobs shows every task in the three groups with the six questions. | FAIL | group heading missing: 'Not started'; group heading missing: 'In progress'; group heading missing: 'Completed'; table[1] columns read [] |
| 22 | L22 @390x844: The overall figure says where the client stands. | PASS | standing phrase present: True; percentage present: True, fraction present: True |

**Failed:**

- L12 @1920x1080: Every task table shows the six questions, in order, and they are not r: client:area: [data-testid='task-table'] not found; client:jobs table[1]: no header cells
- L15 @1920x1080: The client can confirm a task assigned to them and can do nothing else: confirm present; forbidden controls: area[1]: 'WhatReview the employee access tracker: who can reach what personal data, and whether they still need to.HowMITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.WhoMITMARKWhen21 Oct 2026DoneNot yetStatusOn trackNot started'; area[1]: 'WhatReview the employee access tracker: who can reach what personal data, and whether they still need to.HowMITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.WhoMITMARKWhen21 Jan 2027DoneNot yetStatusOn trackNot started'; area[1]: 'WhatReview the employee access tracker: who can reach what personal data, and whether they still need to.HowMITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.WhoMITMARKWhen21 Apr 2027DoneNot yetStatusOn trackNot started'; area[1]: 'WhatReview the employee access tracker: who can reach what personal data, and whether they still need to.HowMITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.WhoMITMARKWhen21 Jul 2027DoneNot yetStatusOn trackNot started'
- L19 @1920x1080: The eight modules carry their v1.2 titles.: [data-testid='area-tile-name'] not found; sub-nav reads ['1. DPO registration', '2. Data tracker review', '3. Data retention', '4. Policy review', '5. Data protection impact assessment', '6. Data subject requests', '7. Vendor data risk', '8. Data breach and incident management']
- L21 @1920x1080: Jobs shows every task in the three groups with the six questions.: group heading missing: 'Not started'; group heading missing: 'In progress'; group heading missing: 'Completed'; table[1] columns read []
- L12 @1366x768: Every task table shows the six questions, in order, and they are not r: client:area: [data-testid='task-table'] not found; client:jobs table[1]: no header cells
- L19 @1366x768: The eight modules carry their v1.2 titles.: [data-testid='area-tile-name'] not found; sub-nav reads ['1. DPO registration', '2. Data tracker review', '3. Data retention', '4. Policy review', '5. Data protection impact assessment', '6. Data subject requests', '7. Vendor data risk', '8. Data breach and incident management']
- L21 @1366x768: Jobs shows every task in the three groups with the six questions.: group heading missing: 'Not started'; group heading missing: 'In progress'; group heading missing: 'Completed'; table[1] columns read []
- L6 @390x844: With the operator's show illustrative switch off, no illustrative entr: the operator's settings view was not reachable
- L7 @390x844: Print output hides the header and navigation and shows the Statement.: chrome visible under print: False, statement visible under print: False
- L12 @390x844: Every task table shows the six questions, in order, and they are not r: client:jobs table[1]: no header cells
- L15 @390x844: The client can confirm a task assigned to them and can do nothing else: confirm present; forbidden controls: area[1]: 'WHAT

Review the employee access tracker: who can reach what personal data, and whether they still need to.

HOW

MITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.

WHO

MITMARK

WHEN

21 Oct 2026

DONE

Not yet

STATUS

ON TRACK
Not started'; area[1]: 'WHAT

Review the employee access tracker: who can reach what personal data, and whether they still need to.

HOW

MITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.

WHO

MITMARK

WHEN

21 Jan 2027

DONE

Not yet

STATUS

ON TRACK
Not started'; area[1]: 'WHAT

Review the employee access tracker: who can reach what personal data, and whether they still need to.

HOW

MITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.

WHO

MITMARK

WHEN

21 Apr 2027

DONE

Not yet

STATUS

ON TRACK
Not started'; area[1]: 'WHAT

Review the employee access tracker: who can reach what personal data, and whether they still need to.

HOW

MITMARK checks the access tracker against current staff and systems, and flags any access that should be removed.

WHO

MITMARK

WHEN

21 Jul 2027

DONE

Not yet

STATUS

ON TRACK
Not started'
- L19 @390x844: The eight modules carry their v1.2 titles.: [data-testid='area-tile-name'] not found; sub-nav reads ['1. DPO registration', '2. Data tracker review', '3. Data retention', '4. Policy review', '5. Data protection impact assessment', '6. Data subject requests', '7. Vendor data risk', '8. Data breach and incident management']
- L21 @390x844: Jobs shows every task in the three groups with the six questions.: group heading missing: 'Not started'; group heading missing: 'In progress'; group heading missing: 'Completed'; table[1] columns read []

## Run 2026-09-22 09:41Z - https://tessera-assure.netlify.app

**Operation:** ASSURE. **Iteration:** v1.2. **Verdict:** FAIL, 49 of 75.

| Line | Check | Result | Detail |
|---|---|---|---|
|  | static: source found | PASS | 122 files |
|  | static: no banned term | PASS |  |
|  | static: no em dash in source | PASS |  |
|  | static: no retired colour | PASS |  |
|  | static: no restricted name present | PASS | 2 restricted names checked, 0 hits |
|  | static: no key value in source | PASS | 0 pattern(s) matched |
|  | static: print stylesheet present in source | PASS | '@media print' found |
|  | static: TASK_COLUMNS is What, How, Who, When, Done, Status in order | PASS | matches exactly |
|  | static: the eight module names match FRAGO 02 section 3, in order | PASS | matches exactly |
|  | static: no file write outside documents.ts and the Blobs store | PASS | no hits |
|  | driven: definition of done present | PASS | 22 lines |
| 1 | L1 @1920x1080: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='tracker'] present |
| 2 | L2 @1920x1080: Every client portal view loads and renders a heading: Compliance Track | FAIL | failed: documents:nav-missing, jobs:nav-missing |
| 3 | L3 @1920x1080: Signed in as the operator, every admin view loads and renders a headin | FAIL | failed: documents-admin:nav-missing, jobs-admin:nav-missing |
| 4 | L4 @1920x1080: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @1920x1080: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1920x1080: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1920x1080: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1920x1080: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @1920x1080: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @1920x1080: Every task table shows the six questions, in order, and they are not r | FAIL | client:area: [data-testid='task-table'] not found; client:jobs: view not reachable |
| 13 | L13 @1920x1080: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @1920x1080: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @1920x1080: The client can confirm a task assigned to them and can do nothing else | FAIL | confirm present; forbidden controls: jobs: view not reachable; documents: view not reachable |
| 16 | L16 @1920x1080: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, task table visible: True |
| 17 | L17 @1920x1080: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 18 | L18 @1920x1080: The client's navigation is Lurong's, in her order. | FAIL | expected ['tracker', 'documents', 'jobs', 'request', 'value', 'statement'], got ['tracker', 'guide', 'request', 'value', 'statement', 'posture', 'exposure'] |
| 19 | L19 @1920x1080: The eight modules carry their v1.2 titles. | FAIL | [data-testid='area-tile-name'] not found; [data-testid='module-nav-item'] not found |
| 20 | L20 @1920x1080: Compliance Documents shows the three sections and the client cannot wr | FAIL | the client documents view was not reachable |
| 21 | L21 @1920x1080: Jobs shows every task in the three groups with the six questions. | FAIL | the client jobs view was not reachable |
| 22 | L22 @1920x1080: The overall figure says where the client stands. | PASS | standing phrase present: True; percentage present: True, fraction present: True |
| 1 | L1 @1366x768: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='tracker'] present |
| 2 | L2 @1366x768: Every client portal view loads and renders a heading: Compliance Track | FAIL | failed: documents:nav-missing, jobs:nav-missing |
| 3 | L3 @1366x768: Signed in as the operator, every admin view loads and renders a headin | FAIL | failed: documents-admin:nav-missing, jobs-admin:nav-missing |
| 4 | L4 @1366x768: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @1366x768: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1366x768: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1366x768: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1366x768: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @1366x768: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @1366x768: Every task table shows the six questions, in order, and they are not r | FAIL | client:area: [data-testid='task-table'] not found; client:jobs: view not reachable |
| 13 | L13 @1366x768: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @1366x768: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @1366x768: The client can confirm a task assigned to them and can do nothing else | FAIL | confirm present; forbidden controls: jobs: view not reachable; documents: view not reachable |
| 16 | L16 @1366x768: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, task table visible: True |
| 17 | L17 @1366x768: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 18 | L18 @1366x768: The client's navigation is Lurong's, in her order. | FAIL | expected ['tracker', 'documents', 'jobs', 'request', 'value', 'statement'], got ['tracker', 'guide', 'request', 'value', 'statement', 'posture', 'exposure'] |
| 19 | L19 @1366x768: The eight modules carry their v1.2 titles. | FAIL | [data-testid='area-tile-name'] not found; [data-testid='module-nav-item'] not found |
| 20 | L20 @1366x768: Compliance Documents shows the three sections and the client cannot wr | FAIL | the client documents view was not reachable |
| 21 | L21 @1366x768: Jobs shows every task in the three groups with the six questions. | FAIL | the client jobs view was not reachable |
| 22 | L22 @1366x768: The overall figure says where the client stands. | PASS | standing phrase present: True; percentage present: True, fraction present: True |
| 1 | L1 @390x844: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='tracker'] present |
| 2 | L2 @390x844: Every client portal view loads and renders a heading: Compliance Track | FAIL | failed: documents:nav-missing, jobs:nav-missing |
| 3 | L3 @390x844: Signed in as the operator, every admin view loads and renders a headin | FAIL | failed: documents-admin:nav-missing, jobs-admin:nav-missing |
| 4 | L4 @390x844: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @390x844: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @390x844: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @390x844: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 8 | L8 @390x844: At 390 pixels wide, no view produces horizontal overflow, including th | FAIL | overflow on: documents:nav-missing, jobs:nav-missing |
| 9 | L9 @390x844: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @390x844: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @390x844: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @390x844: Every task table shows the six questions, in order, and they are not r | FAIL | client:area: [data-testid='task-table'] not found; client:jobs: view not reachable |
| 13 | L13 @390x844: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @390x844: No illustrative figure is reachable on the client side of the tracker. | FAIL | 'illustrative' found on: tracker: view not reachable |
| 15 | L15 @390x844: The client can confirm a task assigned to them and can do nothing else | FAIL | confirm present; forbidden controls: jobs: view not reachable; documents: view not reachable |
| 16 | L16 @390x844: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, task table visible: True |
| 17 | L17 @390x844: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 18 | L18 @390x844: The client's navigation is Lurong's, in her order. | FAIL | expected ['tracker', 'documents', 'jobs', 'request', 'value', 'statement'], got ['tracker', 'guide', 'request', 'value', 'statement', 'posture', 'exposure'] |
| 19 | L19 @390x844: The eight modules carry their v1.2 titles. | FAIL | [data-testid='area-tile-name'] not found; [data-testid='module-nav-item'] not found |
| 20 | L20 @390x844: Compliance Documents shows the three sections and the client cannot wr | FAIL | the client documents view was not reachable |
| 21 | L21 @390x844: Jobs shows every task in the three groups with the six questions. | FAIL | the client jobs view was not reachable |
| 22 | L22 @390x844: The overall figure says where the client stands. | PASS | standing phrase present: True; percentage present: True, fraction present: True |

**Failed:**

- L2 @1920x1080: Every client portal view loads and renders a heading: Compliance Track: failed: documents:nav-missing, jobs:nav-missing
- L3 @1920x1080: Signed in as the operator, every admin view loads and renders a headin: failed: documents-admin:nav-missing, jobs-admin:nav-missing
- L12 @1920x1080: Every task table shows the six questions, in order, and they are not r: client:area: [data-testid='task-table'] not found; client:jobs: view not reachable
- L15 @1920x1080: The client can confirm a task assigned to them and can do nothing else: confirm present; forbidden controls: jobs: view not reachable; documents: view not reachable
- L18 @1920x1080: The client's navigation is Lurong's, in her order.: expected ['tracker', 'documents', 'jobs', 'request', 'value', 'statement'], got ['tracker', 'guide', 'request', 'value', 'statement', 'posture', 'exposure']
- L19 @1920x1080: The eight modules carry their v1.2 titles.: [data-testid='area-tile-name'] not found; [data-testid='module-nav-item'] not found
- L20 @1920x1080: Compliance Documents shows the three sections and the client cannot wr: the client documents view was not reachable
- L21 @1920x1080: Jobs shows every task in the three groups with the six questions.: the client jobs view was not reachable
- L2 @1366x768: Every client portal view loads and renders a heading: Compliance Track: failed: documents:nav-missing, jobs:nav-missing
- L3 @1366x768: Signed in as the operator, every admin view loads and renders a headin: failed: documents-admin:nav-missing, jobs-admin:nav-missing
- L12 @1366x768: Every task table shows the six questions, in order, and they are not r: client:area: [data-testid='task-table'] not found; client:jobs: view not reachable
- L15 @1366x768: The client can confirm a task assigned to them and can do nothing else: confirm present; forbidden controls: jobs: view not reachable; documents: view not reachable
- L18 @1366x768: The client's navigation is Lurong's, in her order.: expected ['tracker', 'documents', 'jobs', 'request', 'value', 'statement'], got ['tracker', 'guide', 'request', 'value', 'statement', 'posture', 'exposure']
- L19 @1366x768: The eight modules carry their v1.2 titles.: [data-testid='area-tile-name'] not found; [data-testid='module-nav-item'] not found
- L20 @1366x768: Compliance Documents shows the three sections and the client cannot wr: the client documents view was not reachable
- L21 @1366x768: Jobs shows every task in the three groups with the six questions.: the client jobs view was not reachable
- L2 @390x844: Every client portal view loads and renders a heading: Compliance Track: failed: documents:nav-missing, jobs:nav-missing
- L3 @390x844: Signed in as the operator, every admin view loads and renders a headin: failed: documents-admin:nav-missing, jobs-admin:nav-missing
- L8 @390x844: At 390 pixels wide, no view produces horizontal overflow, including th: overflow on: documents:nav-missing, jobs:nav-missing
- L12 @390x844: Every task table shows the six questions, in order, and they are not r: client:area: [data-testid='task-table'] not found; client:jobs: view not reachable
- L14 @390x844: No illustrative figure is reachable on the client side of the tracker.: 'illustrative' found on: tracker: view not reachable
- L15 @390x844: The client can confirm a task assigned to them and can do nothing else: confirm present; forbidden controls: jobs: view not reachable; documents: view not reachable
- L18 @390x844: The client's navigation is Lurong's, in her order.: expected ['tracker', 'documents', 'jobs', 'request', 'value', 'statement'], got ['tracker', 'guide', 'request', 'value', 'statement', 'posture', 'exposure']
- L19 @390x844: The eight modules carry their v1.2 titles.: [data-testid='area-tile-name'] not found; [data-testid='module-nav-item'] not found
- L20 @390x844: Compliance Documents shows the three sections and the client cannot wr: the client documents view was not reachable
- L21 @390x844: Jobs shows every task in the three groups with the six questions.: the client jobs view was not reachable

## Run 2026-09-22 09:50Z - https://6ab24cf8a3bfe5804cb0fdf1--tessera-assure.netlify.app

**Operation:** ASSURE. **Iteration:** v1.2. **Verdict:** FAIL, 65 of 75.

| Line | Check | Result | Detail |
|---|---|---|---|
|  | static: source found | PASS | 122 files |
|  | static: no banned term | PASS |  |
|  | static: no em dash in source | PASS |  |
|  | static: no retired colour | PASS |  |
|  | static: no restricted name present | PASS | 2 restricted names checked, 0 hits |
|  | static: no key value in source | PASS | 0 pattern(s) matched |
|  | static: print stylesheet present in source | PASS | '@media print' found |
|  | static: TASK_COLUMNS is What, How, Who, When, Done, Status in order | PASS | matches exactly |
|  | static: the eight module names match FRAGO 02 section 3, in order | PASS | matches exactly |
|  | static: no file write outside documents.ts and the Blobs store | PASS | no hits |
|  | driven: definition of done present | PASS | 22 lines |
| 1 | L1 @1920x1080: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='tracker'] present |
| 2 | L2 @1920x1080: Every client portal view loads and renders a heading: Compliance Track | PASS | 6 views render a heading |
| 3 | L3 @1920x1080: Signed in as the operator, every admin view loads and renders a headin | PASS | 13 views render a heading |
| 4 | L4 @1920x1080: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @1920x1080: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1920x1080: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1920x1080: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1920x1080: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @1920x1080: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @1920x1080: Every task table shows the six questions, in order, and they are not r | FAIL | client:area: [data-testid='task-table'] not found |
| 13 | L13 @1920x1080: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @1920x1080: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @1920x1080: The client can confirm a task assigned to them and can do nothing else | PASS | confirm control present; no edit/delete/reprioritise control found |
| 16 | L16 @1920x1080: An area page prints as a clean document. | FAIL | chrome visible under print: False, obligation visible: True, task table visible: False |
| 17 | L17 @1920x1080: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 18 | L18 @1920x1080: The client's navigation is Lurong's, in her order. | PASS | nav reads ['tracker', 'documents', 'jobs', 'request', 'value', 'statement'], in order, with none of ['posture', 'exposure'] |
| 19 | L19 @1920x1080: The eight modules carry their v1.2 titles. | PASS | 8 module names match AREAS on tiles and sub-nav |
| 20 | L20 @1920x1080: Compliance Documents shows the three sections and the client cannot wr | PASS | three sections present, no upload input, no write control |
| 21 | L21 @1920x1080: Jobs shows every task in the three groups with the six questions. | FAIL | group heading missing: 'Not started'; group heading missing: 'In progress'; group heading missing: 'Completed' |
| 22 | L22 @1920x1080: The overall figure says where the client stands. | PASS | standing phrase present: True; percentage present: True, fraction present: True |
| 1 | L1 @1366x768: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='tracker'] present |
| 2 | L2 @1366x768: Every client portal view loads and renders a heading: Compliance Track | PASS | 6 views render a heading |
| 3 | L3 @1366x768: Signed in as the operator, every admin view loads and renders a headin | PASS | 13 views render a heading |
| 4 | L4 @1366x768: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @1366x768: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1366x768: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1366x768: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1366x768: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @1366x768: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @1366x768: Every task table shows the six questions, in order, and they are not r | FAIL | client:area: [data-testid='task-table'] not found |
| 13 | L13 @1366x768: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @1366x768: No illustrative figure is reachable on the client side of the tracker. | FAIL | 'illustrative' found on: tracker: view not reachable |
| 15 | L15 @1366x768: The client can confirm a task assigned to them and can do nothing else | PASS | confirm control present; no edit/delete/reprioritise control found |
| 16 | L16 @1366x768: An area page prints as a clean document. | FAIL | chrome visible under print: False, obligation visible: True, task table visible: False |
| 17 | L17 @1366x768: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 18 | L18 @1366x768: The client's navigation is Lurong's, in her order. | PASS | nav reads ['tracker', 'documents', 'jobs', 'request', 'value', 'statement'], in order, with none of ['posture', 'exposure'] |
| 19 | L19 @1366x768: The eight modules carry their v1.2 titles. | PASS | 8 module names match AREAS on tiles and sub-nav |
| 20 | L20 @1366x768: Compliance Documents shows the three sections and the client cannot wr | PASS | three sections present, no upload input, no write control |
| 21 | L21 @1366x768: Jobs shows every task in the three groups with the six questions. | FAIL | group heading missing: 'Not started'; group heading missing: 'In progress'; group heading missing: 'Completed' |
| 22 | L22 @1366x768: The overall figure says where the client stands. | PASS | standing phrase present: True; percentage present: True, fraction present: True |
| 1 | L1 @390x844: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='tracker'] present |
| 2 | L2 @390x844: Every client portal view loads and renders a heading: Compliance Track | PASS | 6 views render a heading |
| 3 | L3 @390x844: Signed in as the operator, every admin view loads and renders a headin | PASS | 13 views render a heading |
| 4 | L4 @390x844: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @390x844: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @390x844: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @390x844: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 8 | L8 @390x844: At 390 pixels wide, no view produces horizontal overflow, including th | PASS | 7 views checked, no overflow |
| 9 | L9 @390x844: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @390x844: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @390x844: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @390x844: Every task table shows the six questions, in order, and they are not r | FAIL | client:area: [data-testid='task-table'] not found |
| 13 | L13 @390x844: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @390x844: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @390x844: The client can confirm a task assigned to them and can do nothing else | PASS | confirm control present; no edit/delete/reprioritise control found |
| 16 | L16 @390x844: An area page prints as a clean document. | FAIL | chrome visible under print: False, obligation visible: True, task table visible: False |
| 17 | L17 @390x844: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 18 | L18 @390x844: The client's navigation is Lurong's, in her order. | PASS | nav reads ['tracker', 'documents', 'jobs', 'request', 'value', 'statement'], in order, with none of ['posture', 'exposure'] |
| 19 | L19 @390x844: The eight modules carry their v1.2 titles. | PASS | 8 module names match AREAS on tiles and sub-nav |
| 20 | L20 @390x844: Compliance Documents shows the three sections and the client cannot wr | PASS | three sections present, no upload input, no write control |
| 21 | L21 @390x844: Jobs shows every task in the three groups with the six questions. | FAIL | group heading missing: 'Not started'; group heading missing: 'In progress'; group heading missing: 'Completed' |
| 22 | L22 @390x844: The overall figure says where the client stands. | PASS | standing phrase present: True; percentage present: True, fraction present: True |

**Failed:**

- L12 @1920x1080: Every task table shows the six questions, in order, and they are not r: client:area: [data-testid='task-table'] not found
- L16 @1920x1080: An area page prints as a clean document.: chrome visible under print: False, obligation visible: True, task table visible: False
- L21 @1920x1080: Jobs shows every task in the three groups with the six questions.: group heading missing: 'Not started'; group heading missing: 'In progress'; group heading missing: 'Completed'
- L12 @1366x768: Every task table shows the six questions, in order, and they are not r: client:area: [data-testid='task-table'] not found
- L14 @1366x768: No illustrative figure is reachable on the client side of the tracker.: 'illustrative' found on: tracker: view not reachable
- L16 @1366x768: An area page prints as a clean document.: chrome visible under print: False, obligation visible: True, task table visible: False
- L21 @1366x768: Jobs shows every task in the three groups with the six questions.: group heading missing: 'Not started'; group heading missing: 'In progress'; group heading missing: 'Completed'
- L12 @390x844: Every task table shows the six questions, in order, and they are not r: client:area: [data-testid='task-table'] not found
- L16 @390x844: An area page prints as a clean document.: chrome visible under print: False, obligation visible: True, task table visible: False
- L21 @390x844: Jobs shows every task in the three groups with the six questions.: group heading missing: 'Not started'; group heading missing: 'In progress'; group heading missing: 'Completed'

## Run 2026-09-22 10:02Z - https://6ab24fd43b4730c00c78c16f--tessera-assure.netlify.app

**Operation:** ASSURE. **Iteration:** v1.2. **Verdict:** FAIL, 71 of 75.

| Line | Check | Result | Detail |
|---|---|---|---|
|  | static: source found | PASS | 122 files |
|  | static: no banned term | PASS |  |
|  | static: no em dash in source | PASS |  |
|  | static: no retired colour | PASS |  |
|  | static: no restricted name present | PASS | 2 restricted names checked, 0 hits |
|  | static: no key value in source | PASS | 0 pattern(s) matched |
|  | static: print stylesheet present in source | PASS | '@media print' found |
|  | static: TASK_COLUMNS is What, How, Who, When, Done, Status in order | PASS | matches exactly |
|  | static: the eight module names match FRAGO 02 section 3, in order | PASS | matches exactly |
|  | static: no file write outside documents.ts and the Blobs store | PASS | no hits |
|  | driven: definition of done present | PASS | 22 lines |
| 1 | L1 @1920x1080: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='tracker'] present |
| 2 | L2 @1920x1080: Every client portal view loads and renders a heading: Compliance Track | PASS | 6 views render a heading |
| 3 | L3 @1920x1080: Signed in as the operator, every admin view loads and renders a headin | PASS | 13 views render a heading |
| 4 | L4 @1920x1080: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @1920x1080: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1920x1080: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1920x1080: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1920x1080: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @1920x1080: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @1920x1080: Every task table shows the six questions, in order, and they are not r | PASS | 4 task table(s) carry the six questions in order |
| 13 | L13 @1920x1080: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @1920x1080: No illustrative figure is reachable on the client side of the tracker. | FAIL | 'illustrative' found on: tracker: view not reachable |
| 15 | L15 @1920x1080: The client can confirm a task assigned to them and can do nothing else | PASS | confirm control present; no edit/delete/reprioritise control found |
| 16 | L16 @1920x1080: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, task table visible: True |
| 17 | L17 @1920x1080: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 18 | L18 @1920x1080: The client's navigation is Lurong's, in her order. | PASS | nav reads ['tracker', 'documents', 'jobs', 'request', 'value', 'statement'], in order, with none of ['posture', 'exposure'] |
| 19 | L19 @1920x1080: The eight modules carry their v1.2 titles. | PASS | 8 module names match AREAS on tiles and sub-nav |
| 20 | L20 @1920x1080: Compliance Documents shows the three sections and the client cannot wr | PASS | three sections present, no upload input, no write control |
| 21 | L21 @1920x1080: Jobs shows every task in the three groups with the six questions. | PASS | three groups present, task tables carry the six columns, confirm control present |
| 22 | L22 @1920x1080: The overall figure says where the client stands. | PASS | standing phrase present: True; percentage present: True, fraction present: True |
| 1 | L1 @1366x768: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='tracker'] present |
| 2 | L2 @1366x768: Every client portal view loads and renders a heading: Compliance Track | PASS | 6 views render a heading |
| 3 | L3 @1366x768: Signed in as the operator, every admin view loads and renders a headin | PASS | 13 views render a heading |
| 4 | L4 @1366x768: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @1366x768: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1366x768: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1366x768: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1366x768: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @1366x768: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @1366x768: Every task table shows the six questions, in order, and they are not r | FAIL | client:area: [data-testid='task-table'] not found |
| 13 | L13 @1366x768: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @1366x768: No illustrative figure is reachable on the client side of the tracker. | FAIL | 'illustrative' found on: tracker: view not reachable |
| 15 | L15 @1366x768: The client can confirm a task assigned to them and can do nothing else | PASS | confirm control present; no edit/delete/reprioritise control found |
| 16 | L16 @1366x768: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, task table visible: True |
| 17 | L17 @1366x768: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 18 | L18 @1366x768: The client's navigation is Lurong's, in her order. | PASS | nav reads ['tracker', 'documents', 'jobs', 'request', 'value', 'statement'], in order, with none of ['posture', 'exposure'] |
| 19 | L19 @1366x768: The eight modules carry their v1.2 titles. | PASS | 8 module names match AREAS on tiles and sub-nav |
| 20 | L20 @1366x768: Compliance Documents shows the three sections and the client cannot wr | PASS | three sections present, no upload input, no write control |
| 21 | L21 @1366x768: Jobs shows every task in the three groups with the six questions. | PASS | three groups present, task tables carry the six columns, confirm control present |
| 22 | L22 @1366x768: The overall figure says where the client stands. | PASS | standing phrase present: True; percentage present: True, fraction present: True |
| 1 | L1 @390x844: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='tracker'] present |
| 2 | L2 @390x844: Every client portal view loads and renders a heading: Compliance Track | PASS | 6 views render a heading |
| 3 | L3 @390x844: Signed in as the operator, every admin view loads and renders a headin | PASS | 13 views render a heading |
| 4 | L4 @390x844: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @390x844: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @390x844: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @390x844: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 8 | L8 @390x844: At 390 pixels wide, no view produces horizontal overflow, including th | PASS | 7 views checked, no overflow |
| 9 | L9 @390x844: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @390x844: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @390x844: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @390x844: Every task table shows the six questions, in order, and they are not r | PASS | 4 task table(s) carry the six questions in order |
| 13 | L13 @390x844: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @390x844: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @390x844: The client can confirm a task assigned to them and can do nothing else | PASS | confirm control present; no edit/delete/reprioritise control found |
| 16 | L16 @390x844: An area page prints as a clean document. | FAIL | chrome visible under print: False, obligation visible: True, task table visible: False |
| 17 | L17 @390x844: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 18 | L18 @390x844: The client's navigation is Lurong's, in her order. | PASS | nav reads ['tracker', 'documents', 'jobs', 'request', 'value', 'statement'], in order, with none of ['posture', 'exposure'] |
| 19 | L19 @390x844: The eight modules carry their v1.2 titles. | PASS | 8 module names match AREAS on tiles and sub-nav |
| 20 | L20 @390x844: Compliance Documents shows the three sections and the client cannot wr | PASS | three sections present, no upload input, no write control |
| 21 | L21 @390x844: Jobs shows every task in the three groups with the six questions. | PASS | three groups present, task tables carry the six columns, confirm control present |
| 22 | L22 @390x844: The overall figure says where the client stands. | PASS | standing phrase present: True; percentage present: True, fraction present: True |

**Failed:**

- L14 @1920x1080: No illustrative figure is reachable on the client side of the tracker.: 'illustrative' found on: tracker: view not reachable
- L12 @1366x768: Every task table shows the six questions, in order, and they are not r: client:area: [data-testid='task-table'] not found
- L14 @1366x768: No illustrative figure is reachable on the client side of the tracker.: 'illustrative' found on: tracker: view not reachable
- L16 @390x844: An area page prints as a clean document.: chrome visible under print: False, obligation visible: True, task table visible: False

## Run 2026-09-22 10:12Z - https://6ab24fd43b4730c00c78c16f--tessera-assure.netlify.app

**Operation:** ASSURE. **Iteration:** v1.2. **Verdict:** FAIL, 74 of 75.

| Line | Check | Result | Detail |
|---|---|---|---|
|  | static: source found | PASS | 122 files |
|  | static: no banned term | PASS |  |
|  | static: no em dash in source | PASS |  |
|  | static: no retired colour | PASS |  |
|  | static: no restricted name present | PASS | 2 restricted names checked, 0 hits |
|  | static: no key value in source | PASS | 0 pattern(s) matched |
|  | static: print stylesheet present in source | PASS | '@media print' found |
|  | static: TASK_COLUMNS is What, How, Who, When, Done, Status in order | PASS | matches exactly |
|  | static: the eight module names match FRAGO 02 section 3, in order | PASS | matches exactly |
|  | static: no file write outside documents.ts and the Blobs store | PASS | no hits |
|  | driven: definition of done present | PASS | 22 lines |
| 1 | L1 @1920x1080: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='tracker'] present |
| 2 | L2 @1920x1080: Every client portal view loads and renders a heading: Compliance Track | PASS | 6 views render a heading |
| 3 | L3 @1920x1080: Signed in as the operator, every admin view loads and renders a headin | PASS | 13 views render a heading |
| 4 | L4 @1920x1080: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @1920x1080: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1920x1080: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1920x1080: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1920x1080: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @1920x1080: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @1920x1080: Every task table shows the six questions, in order, and they are not r | PASS | 4 task table(s) carry the six questions in order |
| 13 | L13 @1920x1080: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @1920x1080: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @1920x1080: The client can confirm a task assigned to them and can do nothing else | PASS | confirm control present; no edit/delete/reprioritise control found |
| 16 | L16 @1920x1080: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, tasks visible: True |
| 17 | L17 @1920x1080: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 18 | L18 @1920x1080: The client's navigation is Lurong's, in her order. | PASS | nav reads ['tracker', 'documents', 'jobs', 'request', 'value', 'statement'], in order, with none of ['posture', 'exposure'] |
| 19 | L19 @1920x1080: The eight modules carry their v1.2 titles. | PASS | 8 module names match AREAS on tiles and sub-nav |
| 20 | L20 @1920x1080: Compliance Documents shows the three sections and the client cannot wr | PASS | three sections present, no upload input, no write control |
| 21 | L21 @1920x1080: Jobs shows every task in the three groups with the six questions. | PASS | three groups present, task tables carry the six columns, confirm control present |
| 22 | L22 @1920x1080: The overall figure says where the client stands. | PASS | standing phrase present: True; percentage present: True, fraction present: True |
| 1 | L1 @1366x768: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='tracker'] present |
| 2 | L2 @1366x768: Every client portal view loads and renders a heading: Compliance Track | PASS | 6 views render a heading |
| 3 | L3 @1366x768: Signed in as the operator, every admin view loads and renders a headin | PASS | 13 views render a heading |
| 4 | L4 @1366x768: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @1366x768: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1366x768: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1366x768: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1366x768: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @1366x768: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @1366x768: Every task table shows the six questions, in order, and they are not r | PASS | 4 task table(s) carry the six questions in order |
| 13 | L13 @1366x768: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @1366x768: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @1366x768: The client can confirm a task assigned to them and can do nothing else | PASS | confirm control present; no edit/delete/reprioritise control found |
| 16 | L16 @1366x768: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, tasks visible: True |
| 17 | L17 @1366x768: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 18 | L18 @1366x768: The client's navigation is Lurong's, in her order. | PASS | nav reads ['tracker', 'documents', 'jobs', 'request', 'value', 'statement'], in order, with none of ['posture', 'exposure'] |
| 19 | L19 @1366x768: The eight modules carry their v1.2 titles. | PASS | 8 module names match AREAS on tiles and sub-nav |
| 20 | L20 @1366x768: Compliance Documents shows the three sections and the client cannot wr | PASS | three sections present, no upload input, no write control |
| 21 | L21 @1366x768: Jobs shows every task in the three groups with the six questions. | PASS | three groups present, task tables carry the six columns, confirm control present |
| 22 | L22 @1366x768: The overall figure says where the client stands. | PASS | standing phrase present: True; percentage present: True, fraction present: True |
| 1 | L1 @390x844: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='tracker'] present |
| 2 | L2 @390x844: Every client portal view loads and renders a heading: Compliance Track | PASS | 6 views render a heading |
| 3 | L3 @390x844: Signed in as the operator, every admin view loads and renders a headin | PASS | 13 views render a heading |
| 4 | L4 @390x844: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @390x844: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @390x844: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @390x844: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 8 | L8 @390x844: At 390 pixels wide, no view produces horizontal overflow, including th | PASS | 7 views checked, no overflow |
| 9 | L9 @390x844: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @390x844: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @390x844: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @390x844: Every task table shows the six questions, in order, and they are not r | FAIL | client:area: [data-testid='task-table'] not found |
| 13 | L13 @390x844: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @390x844: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @390x844: The client can confirm a task assigned to them and can do nothing else | PASS | confirm control present; no edit/delete/reprioritise control found |
| 16 | L16 @390x844: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, tasks visible: True |
| 17 | L17 @390x844: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 18 | L18 @390x844: The client's navigation is Lurong's, in her order. | PASS | nav reads ['tracker', 'documents', 'jobs', 'request', 'value', 'statement'], in order, with none of ['posture', 'exposure'] |
| 19 | L19 @390x844: The eight modules carry their v1.2 titles. | PASS | 8 module names match AREAS on tiles and sub-nav |
| 20 | L20 @390x844: Compliance Documents shows the three sections and the client cannot wr | PASS | three sections present, no upload input, no write control |
| 21 | L21 @390x844: Jobs shows every task in the three groups with the six questions. | PASS | three groups present, task tables carry the six columns, confirm control present |
| 22 | L22 @390x844: The overall figure says where the client stands. | PASS | standing phrase present: True; percentage present: True, fraction present: True |

**Failed:**

- L12 @390x844: Every task table shows the six questions, in order, and they are not r: client:area: [data-testid='task-table'] not found

## Run 2026-09-22 10:21Z - https://6ab24fd43b4730c00c78c16f--tessera-assure.netlify.app

**Operation:** ASSURE. **Iteration:** v1.2. **Verdict:** PASS, 75 of 75.

| Line | Check | Result | Detail |
|---|---|---|---|
|  | static: source found | PASS | 122 files |
|  | static: no banned term | PASS |  |
|  | static: no em dash in source | PASS |  |
|  | static: no retired colour | PASS |  |
|  | static: no restricted name present | PASS | 2 restricted names checked, 0 hits |
|  | static: no key value in source | PASS | 0 pattern(s) matched |
|  | static: print stylesheet present in source | PASS | '@media print' found |
|  | static: TASK_COLUMNS is What, How, Who, When, Done, Status in order | PASS | matches exactly |
|  | static: the eight module names match FRAGO 02 section 3, in order | PASS | matches exactly |
|  | static: no file write outside documents.ts and the Blobs store | PASS | no hits |
|  | driven: definition of done present | PASS | 22 lines |
| 1 | L1 @1920x1080: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='tracker'] present |
| 2 | L2 @1920x1080: Every client portal view loads and renders a heading: Compliance Track | PASS | 6 views render a heading |
| 3 | L3 @1920x1080: Signed in as the operator, every admin view loads and renders a headin | PASS | 13 views render a heading |
| 4 | L4 @1920x1080: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @1920x1080: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1920x1080: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1920x1080: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1920x1080: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @1920x1080: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @1920x1080: Every task table shows the six questions, in order, and they are not r | PASS | 4 task table(s) carry the six questions in order |
| 13 | L13 @1920x1080: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @1920x1080: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @1920x1080: The client can confirm a task assigned to them and can do nothing else | PASS | confirm control present; no edit/delete/reprioritise control found |
| 16 | L16 @1920x1080: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, tasks visible: True |
| 17 | L17 @1920x1080: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 18 | L18 @1920x1080: The client's navigation is Lurong's, in her order. | PASS | nav reads ['tracker', 'documents', 'jobs', 'request', 'value', 'statement'], in order, with none of ['posture', 'exposure'] |
| 19 | L19 @1920x1080: The eight modules carry their v1.2 titles. | PASS | 8 module names match AREAS on tiles and sub-nav |
| 20 | L20 @1920x1080: Compliance Documents shows the three sections and the client cannot wr | PASS | three sections present, no upload input, no write control |
| 21 | L21 @1920x1080: Jobs shows every task in the three groups with the six questions. | PASS | three groups present, task tables carry the six columns, confirm control present |
| 22 | L22 @1920x1080: The overall figure says where the client stands. | PASS | standing phrase present: True; percentage present: True, fraction present: True |
| 1 | L1 @1366x768: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='tracker'] present |
| 2 | L2 @1366x768: Every client portal view loads and renders a heading: Compliance Track | PASS | 6 views render a heading |
| 3 | L3 @1366x768: Signed in as the operator, every admin view loads and renders a headin | PASS | 13 views render a heading |
| 4 | L4 @1366x768: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @1366x768: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1366x768: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1366x768: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1366x768: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @1366x768: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @1366x768: Every task table shows the six questions, in order, and they are not r | PASS | 4 task table(s) carry the six questions in order |
| 13 | L13 @1366x768: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @1366x768: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @1366x768: The client can confirm a task assigned to them and can do nothing else | PASS | confirm control present; no edit/delete/reprioritise control found |
| 16 | L16 @1366x768: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, tasks visible: True |
| 17 | L17 @1366x768: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 18 | L18 @1366x768: The client's navigation is Lurong's, in her order. | PASS | nav reads ['tracker', 'documents', 'jobs', 'request', 'value', 'statement'], in order, with none of ['posture', 'exposure'] |
| 19 | L19 @1366x768: The eight modules carry their v1.2 titles. | PASS | 8 module names match AREAS on tiles and sub-nav |
| 20 | L20 @1366x768: Compliance Documents shows the three sections and the client cannot wr | PASS | three sections present, no upload input, no write control |
| 21 | L21 @1366x768: Jobs shows every task in the three groups with the six questions. | PASS | three groups present, task tables carry the six columns, confirm control present |
| 22 | L22 @1366x768: The overall figure says where the client stands. | PASS | standing phrase present: True; percentage present: True, fraction present: True |
| 1 | L1 @390x844: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='tracker'] present |
| 2 | L2 @390x844: Every client portal view loads and renders a heading: Compliance Track | PASS | 6 views render a heading |
| 3 | L3 @390x844: Signed in as the operator, every admin view loads and renders a headin | PASS | 13 views render a heading |
| 4 | L4 @390x844: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @390x844: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @390x844: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @390x844: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 8 | L8 @390x844: At 390 pixels wide, no view produces horizontal overflow, including th | PASS | 7 views checked, no overflow |
| 9 | L9 @390x844: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @390x844: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @390x844: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @390x844: Every task table shows the six questions, in order, and they are not r | PASS | 4 task table(s) carry the six questions in order |
| 13 | L13 @390x844: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @390x844: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @390x844: The client can confirm a task assigned to them and can do nothing else | PASS | confirm control present; no edit/delete/reprioritise control found |
| 16 | L16 @390x844: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, tasks visible: True |
| 17 | L17 @390x844: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 18 | L18 @390x844: The client's navigation is Lurong's, in her order. | PASS | nav reads ['tracker', 'documents', 'jobs', 'request', 'value', 'statement'], in order, with none of ['posture', 'exposure'] |
| 19 | L19 @390x844: The eight modules carry their v1.2 titles. | PASS | 8 module names match AREAS on tiles and sub-nav |
| 20 | L20 @390x844: Compliance Documents shows the three sections and the client cannot wr | PASS | three sections present, no upload input, no write control |
| 21 | L21 @390x844: Jobs shows every task in the three groups with the six questions. | PASS | three groups present, task tables carry the six columns, confirm control present |
| 22 | L22 @390x844: The overall figure says where the client stands. | PASS | standing phrase present: True; percentage present: True, fraction present: True |

## Run 2026-09-22 10:33Z - https://tessera-assure.netlify.app

**Operation:** ASSURE. **Iteration:** v1.2. **Verdict:** PASS, 75 of 75.

| Line | Check | Result | Detail |
|---|---|---|---|
|  | static: source found | PASS | 122 files |
|  | static: no banned term | PASS |  |
|  | static: no em dash in source | PASS |  |
|  | static: no retired colour | PASS |  |
|  | static: no restricted name present | PASS | 2 restricted names checked, 0 hits |
|  | static: no key value in source | PASS | 0 pattern(s) matched |
|  | static: print stylesheet present in source | PASS | '@media print' found |
|  | static: TASK_COLUMNS is What, How, Who, When, Done, Status in order | PASS | matches exactly |
|  | static: the eight module names match FRAGO 02 section 3, in order | PASS | matches exactly |
|  | static: no file write outside documents.ts and the Blobs store | PASS | no hits |
|  | driven: definition of done present | PASS | 22 lines |
| 1 | L1 @1920x1080: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='tracker'] present |
| 2 | L2 @1920x1080: Every client portal view loads and renders a heading: Compliance Track | PASS | 6 views render a heading |
| 3 | L3 @1920x1080: Signed in as the operator, every admin view loads and renders a headin | PASS | 13 views render a heading |
| 4 | L4 @1920x1080: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @1920x1080: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1920x1080: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1920x1080: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1920x1080: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1920x1080: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @1920x1080: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @1920x1080: Every task table shows the six questions, in order, and they are not r | PASS | 4 task table(s) carry the six questions in order |
| 13 | L13 @1920x1080: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @1920x1080: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @1920x1080: The client can confirm a task assigned to them and can do nothing else | PASS | confirm control present; no edit/delete/reprioritise control found |
| 16 | L16 @1920x1080: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, tasks visible: True |
| 17 | L17 @1920x1080: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 18 | L18 @1920x1080: The client's navigation is Lurong's, in her order. | PASS | nav reads ['tracker', 'documents', 'jobs', 'request', 'value', 'statement'], in order, with none of ['posture', 'exposure'] |
| 19 | L19 @1920x1080: The eight modules carry their v1.2 titles. | PASS | 8 module names match AREAS on tiles and sub-nav |
| 20 | L20 @1920x1080: Compliance Documents shows the three sections and the client cannot wr | PASS | three sections present, no upload input, no write control |
| 21 | L21 @1920x1080: Jobs shows every task in the three groups with the six questions. | PASS | three groups present, task tables carry the six columns, confirm control present |
| 22 | L22 @1920x1080: The overall figure says where the client stands. | PASS | standing phrase present: True; percentage present: True, fraction present: True |
| 1 | L1 @1366x768: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='tracker'] present |
| 2 | L2 @1366x768: Every client portal view loads and renders a heading: Compliance Track | PASS | 6 views render a heading |
| 3 | L3 @1366x768: Signed in as the operator, every admin view loads and renders a headin | PASS | 13 views render a heading |
| 4 | L4 @1366x768: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @1366x768: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @1366x768: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @1366x768: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 9 | L9 @1366x768: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @1366x768: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @1366x768: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @1366x768: Every task table shows the six questions, in order, and they are not r | PASS | 4 task table(s) carry the six questions in order |
| 13 | L13 @1366x768: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @1366x768: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @1366x768: The client can confirm a task assigned to them and can do nothing else | PASS | confirm control present; no edit/delete/reprioritise control found |
| 16 | L16 @1366x768: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, tasks visible: True |
| 17 | L17 @1366x768: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 18 | L18 @1366x768: The client's navigation is Lurong's, in her order. | PASS | nav reads ['tracker', 'documents', 'jobs', 'request', 'value', 'statement'], in order, with none of ['posture', 'exposure'] |
| 19 | L19 @1366x768: The eight modules carry their v1.2 titles. | PASS | 8 module names match AREAS on tiles and sub-nav |
| 20 | L20 @1366x768: Compliance Documents shows the three sections and the client cannot wr | PASS | three sections present, no upload input, no write control |
| 21 | L21 @1366x768: Jobs shows every task in the three groups with the six questions. | PASS | three groups present, task tables carry the six columns, confirm control present |
| 22 | L22 @1366x768: The overall figure says where the client stands. | PASS | standing phrase present: True; percentage present: True, fraction present: True |
| 1 | L1 @390x844: Sign-in succeeds and lands on the client portal. | PASS | signed in, [data-view='tracker'] present |
| 2 | L2 @390x844: Every client portal view loads and renders a heading: Compliance Track | PASS | 6 views render a heading |
| 3 | L3 @390x844: Signed in as the operator, every admin view loads and renders a headin | PASS | 13 views render a heading |
| 4 | L4 @390x844: The Record table in the Value view renders at least one row. | PASS | 27 row(s) in [data-testid='record-table'] |
| 5 | L5 @390x844: The Statement renders and contains the limitations paragraph. | PASS | limitations phrase present: True |
| 6 | L6 @390x844: With the operator's show illustrative switch off, no illustrative entr | PASS | 'illustrative' in the client statement with the switch off: False |
| 7 | L7 @390x844: Print output hides the header and navigation and shows the Statement. | PASS | chrome visible under print: False, statement visible under print: True |
| 8 | L8 @390x844: At 390 pixels wide, no view produces horizontal overflow, including th | PASS | 7 views checked, no overflow |
| 9 | L9 @390x844: No console errors or page errors occur across the whole run. | PASS | 0 console or page errors: [] |
| 10 | L10 @390x844: The deployed page declares noindex in the head. | PASS | noindex present in head |
| 11 | L11 @390x844: The client's home is the Compliance Tracker and answers the six questi | PASS | all 6 test ids present |
| 12 | L12 @390x844: Every task table shows the six questions, in order, and they are not r | PASS | 4 task table(s) carry the six questions in order |
| 13 | L13 @390x844: No percentage is shown without its fraction beside it. | PASS | no bare percentage found |
| 14 | L14 @390x844: No illustrative figure is reachable on the client side of the tracker. | PASS | 'illustrative' not found on the client tracker or area page |
| 15 | L15 @390x844: The client can confirm a task assigned to them and can do nothing else | PASS | confirm control present; no edit/delete/reprioritise control found |
| 16 | L16 @390x844: An area page prints as a clean document. | PASS | chrome visible under print: False, obligation visible: True, tasks visible: True |
| 17 | L17 @390x844: "No data yet" is a state, not a blank. | PASS | 6 KPI tile(s), all non-empty |
| 18 | L18 @390x844: The client's navigation is Lurong's, in her order. | PASS | nav reads ['tracker', 'documents', 'jobs', 'request', 'value', 'statement'], in order, with none of ['posture', 'exposure'] |
| 19 | L19 @390x844: The eight modules carry their v1.2 titles. | PASS | 8 module names match AREAS on tiles and sub-nav |
| 20 | L20 @390x844: Compliance Documents shows the three sections and the client cannot wr | PASS | three sections present, no upload input, no write control |
| 21 | L21 @390x844: Jobs shows every task in the three groups with the six questions. | PASS | three groups present, task tables carry the six columns, confirm control present |
| 22 | L22 @390x844: The overall figure says where the client stands. | PASS | standing phrase present: True; percentage present: True, fraction present: True |
