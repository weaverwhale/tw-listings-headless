import * as fs from 'fs';
import axios from 'axios';
import SemVer = require('semver/classes/semver');
import moment from 'moment';
import { globalNpmrcFile } from '../../utils/npmAuth';
import { runProcess } from '../../utils/runProcess';

export async function cleanUpArtifacts(argv) {
  const packageName = argv.package;
  const repo = '//us-central1-npm.pkg.dev/shofifi/npm-packages/:_authToken=';
  const baseUrl = 'https://us-central1-npm.pkg.dev/shofifi/npm-packages';
  const url = `${baseUrl}/${packageName}`;
  const rcData = fs.readFileSync(globalNpmrcFile).toString();
  const lines = rcData.split('\n');
  const token = lines
    .find((l) => l.includes(repo))
    ?.split('=')[1]
    .replaceAll('"', '');
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const { data } = await axios.get(url, {
    headers,
  });
  const tags = Object.keys(data['dist-tags']);
  for (const tag of tags) {
    if (['latest', 'pre'].includes(tag)) continue;
    const res = await axios.delete(`${baseUrl}/-/package/${packageName}/dist-tags/${tag}`, {
      headers,
    });
    console.log(tag, res.status);
  }
  const versions = Object.keys(data['versions']);
  const latest = new SemVer(data['dist-tags']['latest']);
  for (const version of versions) {
    if (['created', 'modified'].includes(version)) continue;
    const semver = new SemVer(version);
    if (!versions.includes(version)) {
      console.log(version, 'not in versions');
      continue;
    }
    const time = data['time'][version];
    const date = moment(time);
    const diff = moment().diff(date, 'days');
    if (semver.prerelease.length) {
      if (diff > 30) {
        console.log(semver);
        await unpublish(packageName, version);
      }
    } else if (latest.minor - semver.minor >= 1 && diff > 200) {
      console.log(semver);
      await unpublish(packageName, version);
    }
  }
}

async function unpublish(packageName: string, version: string) {
  const { stdout } = await runProcess({
    command: 'npm',
    commandArgs: ['unpublish', `${packageName}@${version}`],
  });
  console.log(stdout);
}
