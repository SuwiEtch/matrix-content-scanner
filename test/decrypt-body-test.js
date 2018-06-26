/**

Copyright 2018 New Vector Ltd.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

**/

const assert = require('assert');
const { PkEncryption } = require('olm');
const { decryptBody, getPublicKey } = require('../src/decrypt-body.js');
const ClientError = require('../src/client-error.js');

// In reality, getting the public key, and doing an encryption is done
// client-side.
const publicKey = getPublicKey();

const encryption = new PkEncryption();
encryption.set_recipient_key(getPublicKey());

describe('decryptBody', () => {
    it('should decrypt an encrypted body', async () => {
        const plainBody = {
            some: 'body',
            with: 'keys',
            nested: {
                arbitrary: 'structure',
            },
        };
        const encryptedBody = encryption.encrypt(JSON.stringify(plainBody));

        const decryptedBody = decryptBody(encryptedBody);
        assert.deepStrictEqual(decryptedBody, plainBody);
    });

    it('should throw 400 if the decrypted body is malformed', async () => {
        const encryptedBody = encryption.encrypt('this is not JSON');

        assert.throws(
            () => decryptBody(encryptedBody),
            (e) => e instanceof ClientError && e.status === 400,
        );
    });

    it('should throw 403 if the decryption is bad', async () => {
        const plainBody = {
            some: 'body',
            with: 'keys',
            nested: {
                arbitrary: 'structure',
            },
        };
        const encryptedBody = encryption.encrypt(JSON.stringify(plainBody));

        encryptedBody.mac = "this is not the mac";

        assert.throws(
            () => decryptBody(encryptedBody),
            (e) => e instanceof ClientError && e.status === 403,
        );
    });
});
