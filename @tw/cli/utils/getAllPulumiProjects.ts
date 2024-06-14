import * as fs from 'fs';
import { pulumiProjectExists } from './fs';
import { cliConfig } from '../config';
import path from 'path';

const blacklist = ['node_modules'];

async function getAllPulumiProjectsRecurse(currentDir: string, depth: number): Promise<string[]> {
  if (depth === 0 || blacklist.includes(path.basename(currentDir))) {
    return [];
  }
  const pulumiProjects: string[] = [];
  const dirEntries = await fs.readdirSync(currentDir, { withFileTypes: true });
  const directories = dirEntries.filter((file) => file.isDirectory()).map((file) => file.name);

  for (const dir of directories) {
    const dirPath = path.join(currentDir, dir);

    if (pulumiProjectExists(dirPath)) {
      pulumiProjects.push(dirPath);
    } else {
      const subdirectoryProjects = await getAllPulumiProjectsRecurse(dirPath, depth - 1);
      pulumiProjects.push(...subdirectoryProjects);
    }
  }

  return pulumiProjects;
}

export async function getAllPulumiProjects(): Promise<string[]> {
  const projectsAbsolutePaths = await getAllPulumiProjectsRecurse(cliConfig.gitRoot, 3);
  const projectsRelativePaths = projectsAbsolutePaths.map((project) =>
    path.relative(cliConfig.gitRoot, project)
  );
  return projectsRelativePaths;
}
