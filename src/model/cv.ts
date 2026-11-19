export interface CvRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  href?: string;
}

export type CvBlock =
  | { type: "paragraph"; runs: CvRun[] }
  | { type: "subheading"; runs: CvRun[] }
  | { type: "list"; items: CvRun[][] };

export interface CvSection {
  title: string;
  blocks: CvBlock[];
}

export interface CvDocument {
  title: string;
  subtitle?: string;
  contacts: CvRun[];
  sections: CvSection[];
}

export interface CvEntry {
  locale: string;
  file: string;
  document: CvDocument;
}
