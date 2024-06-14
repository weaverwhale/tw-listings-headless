type TWInfo = {
  id: string;
  dependencies?: string[];
  devDependencies?: string[];
  infraDependencies?: string[];
  hasTwConfig: boolean;
  isJest?: boolean;
  isPackage: boolean;
  isService: boolean;
  isFetcher?: boolean;
  language: 'ts' | 'python';
  name: string;
  templateDir: string;
  getNames?: (info: TWInfo) => Promise<{
    providerId?: string;
    computerName: string;
    humanName: string;
  }>;
};

type TWTypescript = TWInfo & {
  language: 'ts';
  packageJsonOverrides?: Record<string, any>;
  tsConfigOverrides?: Record<string, any>;
};

type TWPython = TWInfo & {
  language: 'python';
  requirements?: string[];
};

export type TWService = TWInfo & {
  isService: true;
  isPackage: false;
};

type TWPackage = TWInfo & {
  isService: false;
  isPackage: true;
};

export type RepoInfo = {
  providerId?: string;
  computerName: string;
  humanName: string;
  color: string;
  path: string;
  maintainers: string[];
  dockerDeps?: string[];
  tags?: string[];
};

export type TWNodeService = TWService & TWTypescript;

export type TWNodePackage = TWPackage & TWTypescript;

export type TWPythonService = TWService & TWPython;

export type TWServiceRepo = RepoInfo & TWService;

export type TWTsRepo = RepoInfo & TWTypescript;

export type TWPythonRepo = RepoInfo & TWPython;

export type TWRepo = RepoInfo & TWBase;

export type TWBase = (TWTypescript | TWPython) & (TWService | TWPackage);
