/** Where modest spend would improve the product. Delivered at £0; this is the signal. */
export interface SpendItem {
  what: string;
  cost: string;
  who: string;
  note: string;
}

export const SPEND: SpendItem[] = [
  {
    what: 'Shared store for the record, so the operator and the Information Officer see the same entries from any device',
    cost: '£0 to £25 per month',
    who: 'Operator and reader',
    note: 'A small hosted database or a spreadsheet the page reads. Removes the browser-only limit of the beta.',
  },
  {
    what: 'Password on the page',
    cost: '£0 on the current Netlify plan',
    who: 'Reader',
    note: 'Site-wide password before anything client-facing is shared. One setting.',
  },
  {
    what: 'Monthly email digest to the Information Officer with the month’s entries and the running total',
    cost: '£0 to £15 per month',
    who: 'Reader',
    note: 'She sees the value without opening anything. The digest is the statement in short form.',
  },
  {
    what: 'Document vault: each entry links to the deliverable MITMARK produced',
    cost: '£5 to £20 per month',
    who: 'Reader, auditor',
    note: 'Turns the record into evidence. Needed before an audit, not before a renewal conversation.',
  },
  {
    what: 'ICO guidance and enforcement feed into the monthly report',
    cost: '£0 to £30 per month',
    who: 'Operator',
    note: 'Cuts the operator’s preparation time for line 8. Value to MITMARK, not to the client.',
  },
  {
    what: 'Second client tenancy',
    cost: '£0',
    who: 'MITMARK',
    note: 'The product is multi-tenant by design. A second retained client is a second organisation, not a second build.',
  },
];
