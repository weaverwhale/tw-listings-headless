import express, { Router } from 'express';
import { cliConfig } from './config';
import { cliLog, cliSuccess, cliWarning } from './utils/logs';
import { Services } from './types';
import { selectGeneric } from './enquirer/genericSelect';

export const cliRouter = Router();
cliRouter.use(express.json());

cliRouter.post('/emulators-loaded', (req, res) => {
  cliSuccess('Emulators Ready!');
  return res.send('ok');
});

cliRouter.post('/emulators-ready', (req, res) => {
  cliConfig.emulatorsReady = true;
  return res.send('ok');
});

cliRouter.post('/temporal-ready', (req, res) => {
  cliConfig.temporalReady = true;
  cliSuccess('Temporal Ready!');
  return res.send('ok');
});

cliRouter.post('/attach', (req, res) => {
  const body = req.body as Services;
  const filtered = Object.keys(body).filter((key) => {
    const exists = cliConfig.services[key];
    if (exists) cliWarning(`Service ${key} already exists!`);
    return !exists;
  });
  if (!filtered.length) return res.status(400).send('No new services to attach');
  cliLog(`Attaching services: ${filtered.join(', ')}`);
  for (const key of filtered) {
    cliConfig.services[key] = body[key];
  }
  return res.send('ok');
});

cliRouter.post('/select-things', async (req, res) => {
  const { multi = true, message, choices } = req.body;
  const opts = await selectGeneric({
    multi,
    message,
    choices,
  });
  res.json(opts);
});
