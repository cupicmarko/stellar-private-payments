#!/usr/bin/env node
/**
 * Verify required SDK artifacts exist before `tsc` (CI / prepublish).
 */
import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.dirname(fileURLToPath(import.meta.url));
const required = [
  'dist/stellar_private_payments_web.js',
  'dist/stellar_private_payments_web_bg.wasm',
  'dist/stellar_private_payments_web.d.ts',
  'dist/workers/storage-worker.js',
  'dist/workers/prover-worker.js',
  'dist/prover-threads.js',
  'dist/circuits/circuits.json',
  'dist/circuits/policy_tx_2_2.graph.bin',
  'dist/circuits/policy_tx_2_2.r1cs',
  'dist/circuits/policy_tx_2_2_proving_key.bin',
  'dist/circuits/policy_tx_2_2_A.graph.bin',
  'dist/circuits/policy_tx_2_2_A.r1cs',
  'dist/circuits/policy_tx_2_2_A_proving_key.bin',
  'dist/circuits/policy_tx_2_2_B.graph.bin',
  'dist/circuits/policy_tx_2_2_B.r1cs',
  'dist/circuits/policy_tx_2_2_B_proving_key.bin',
  'dist/circuits/policy_tx_2_2_AB.graph.bin',
  'dist/circuits/policy_tx_2_2_AB.r1cs',
  'dist/circuits/policy_tx_2_2_AB_proving_key.bin',
  'dist/circuits/policy_tx_2_2_gvk_V.graph.bin',
  'dist/circuits/policy_tx_2_2_gvk_V.r1cs',
  'dist/circuits/policy_tx_2_2_gvk_V_proving_key.bin',
  'dist/circuits/policy_tx_2_2_gvk_T.graph.bin',
  'dist/circuits/policy_tx_2_2_gvk_T.r1cs',
  'dist/circuits/policy_tx_2_2_gvk_T_proving_key.bin',
  'dist/circuits/policy_tx_2_2_A_gvk_V.graph.bin',
  'dist/circuits/policy_tx_2_2_A_gvk_V.r1cs',
  'dist/circuits/policy_tx_2_2_A_gvk_V_proving_key.bin',
  'dist/circuits/policy_tx_2_2_A_gvk_T.graph.bin',
  'dist/circuits/policy_tx_2_2_A_gvk_T.r1cs',
  'dist/circuits/policy_tx_2_2_A_gvk_T_proving_key.bin',
  'dist/circuits/policy_tx_2_2_B_gvk_V.graph.bin',
  'dist/circuits/policy_tx_2_2_B_gvk_V.r1cs',
  'dist/circuits/policy_tx_2_2_B_gvk_V_proving_key.bin',
  'dist/circuits/policy_tx_2_2_B_gvk_T.graph.bin',
  'dist/circuits/policy_tx_2_2_B_gvk_T.r1cs',
  'dist/circuits/policy_tx_2_2_B_gvk_T_proving_key.bin',
  'dist/circuits/policy_tx_2_2_AB_gvk_V.graph.bin',
  'dist/circuits/policy_tx_2_2_AB_gvk_V.r1cs',
  'dist/circuits/policy_tx_2_2_AB_gvk_V_proving_key.bin',
  'dist/circuits/policy_tx_2_2_AB_gvk_T.graph.bin',
  'dist/circuits/policy_tx_2_2_AB_gvk_T.r1cs',
  'dist/circuits/policy_tx_2_2_AB_gvk_T_proving_key.bin',
  'dist/circuits/selectiveDisclosure_1.graph.bin',
  'dist/circuits/selectiveDisclosure_1.r1cs',
  'dist/circuits/selectiveDisclosure_1_proving_key.bin',
  'dist/circuits/selectiveDisclosure_2.graph.bin',
  'dist/circuits/selectiveDisclosure_2.r1cs',
  'dist/circuits/selectiveDisclosure_2_proving_key.bin',
  'dist/circuits/selectiveDisclosure_3.graph.bin',
  'dist/circuits/selectiveDisclosure_3.r1cs',
  'dist/circuits/selectiveDisclosure_3_proving_key.bin',
  'dist/circuits/selectiveDisclosure_4.graph.bin',
  'dist/circuits/selectiveDisclosure_4.r1cs',
  'dist/circuits/selectiveDisclosure_4_proving_key.bin',
  'dist/circuits/keyOwnership.graph.bin',
  'dist/circuits/keyOwnership.r1cs',
  'dist/circuits/keyOwnership_proving_key.bin',
  'dist/circuits/NOTICE.txt',
  'dist/circuits/source-bundle.tar.gz',
  'dist/licenses/LGPL-3.0.txt',
  'dist/licenses/GPL-3.0.txt',
];

for (const rel of required) {
  const file = path.join(root, '..', rel);
  try {
    await access(file, constants.R_OK);
  } catch {
    console.error(`missing ${rel} — run npm run build`);
    process.exit(1);
  }
}

// A build has the threaded prover worker only with SPP_WEB_THREADS=1, and
// prover-threads.js says which. Either is fine, but the two must agree.
const marker = path.join(root, '..', 'dist/prover-threads.js');
const { threadedProverWorkerUrl } = await import(pathToFileURL(marker).href);
const threaded = [
  'dist/workers/prover-worker-threads.js',
  'dist/workers/prover-worker-threads-module.js',
  'dist/workers/prover-worker-threads-module_bg.wasm',
];
for (const rel of threaded) {
  const present = await access(path.join(root, '..', rel), constants.R_OK).then(() => true, () => false);
  if (present !== Boolean(threadedProverWorkerUrl)) {
    console.error(
      threadedProverWorkerUrl
        ? `missing ${rel} — dist/prover-threads.js names a threaded prover worker`
        : `unexpected ${rel} — dist/prover-threads.js says this build has no threaded prover worker`,
    );
    process.exit(1);
  }
}
