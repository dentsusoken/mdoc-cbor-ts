import { describe, it, expect } from 'vitest';
import { Algorithms, COSEKey, Sign1, UnprotectedHeaders } from '@auth0/cose';
import { Tag } from 'cbor-x';
import { encodeCbor, decodeCbor } from '@/cbor/codec';
import { createTag24 } from '@/cbor/createTag24';
import { buildDocument } from '../buildDocument';
import { buildMobileSecurityObject } from '@/handlers/issue/mso/buildMobileSecurityObject';
import type { IssuerSignedItem } from '@/schemas/mdoc/IssuerSignedItem';
import type { IssuerSigned } from '@/schemas/mdoc/IssuerSigned';
import type { NameSpaceElementIdentifiers } from '@/schemas/record/NameSpaceElementIdentifiers';
import { issuerSignedItemSchema } from '@/schemas/mdoc/IssuerSignedItem';
import { buildProtectedHeaders } from '@/handlers/issue/cose/buildProtectedHeaders';
import { IssuerAuth } from '@/schemas/mso/IssuerAuth';

const unwrap = (tag: Tag): IssuerSignedItem =>
  issuerSignedItemSchema.parse(decodeCbor(tag.value as Uint8Array));

describe('buildDocument', () => {
  it('builds a Document and filters namespaces based on requested identifiers', async () => {
    const { privateKey: issuerPrivateKey, publicKey: issuerPublicKey } =
      await COSEKey.generate(Algorithms.ES256, { crv: 'P-256' });
    const { privateKey: devicePrivateKey, publicKey: devicePublicKey } =
      await COSEKey.generate(Algorithms.ES256, { crv: 'P-256' });

    const ns1Items: Tag[] = [
      createTag24({
        digestID: 1,
        random: new Uint8Array(32),
        elementIdentifier: 'given_name',
        elementValue: 'John',
      }),
      createTag24({
        digestID: 2,
        random: new Uint8Array(32),
        elementIdentifier: 'family_name',
        elementValue: 'Doe',
      }),
      createTag24({
        digestID: 3,
        random: new Uint8Array(32),
        elementIdentifier: 'age',
        elementValue: 30,
      }),
    ];

    const ns2Items: Tag[] = [
      createTag24({
        digestID: 4,
        random: new Uint8Array(32),
        elementIdentifier: 'foo',
        elementValue: 'bar',
      }),
    ];

    const issuerNameSpaces = new Map<string, Tag[]>([
      ['org.iso.18013.5.1', ns1Items],
      ['org.example.custom', ns2Items],
    ]);

    const mso = await buildMobileSecurityObject({
      docType: 'org.iso.18013.5.1.mDL',
      nameSpaces: issuerNameSpaces,
      deviceKey: devicePublicKey.esMap,
      digestAlgorithm: 'SHA-256',
      validFrom: 0,
      validUntil: 0,
    });

    const payload = encodeCbor(createTag24(mso));

    const protectedHeaders = buildProtectedHeaders(issuerPrivateKey);

    const unprotectedHeaders = new UnprotectedHeaders();
    const sign1 = await Sign1.sign(
      protectedHeaders,
      unprotectedHeaders,
      payload,
      await issuerPrivateKey.toKeyLike()
    );

    expect(sign1).toBeInstanceOf(Sign1);
    await expect(
      sign1.verify(await issuerPublicKey.toKeyLike())
    ).resolves.toBeUndefined();

    const issuerSigned: IssuerSigned = {
      nameSpaces: issuerNameSpaces,
      issuerAuth: sign1.getContentForEncoding() as IssuerAuth,
    };

    const requested: NameSpaceElementIdentifiers = {
      'org.iso.18013.5.1': ['given_name', 'family_name'],
    };

    const document = await buildDocument({
      issuerSigned,
      nameSpacesElementIdentifiers: requested,
      devicePrivateKey,
    });

    expect(document.docType).toBe('org.iso.18013.5.1.mDL');
    expect(document.issuerSigned).toBeDefined();

    const selected =
      document.issuerSigned!.nameSpaces.get('org.iso.18013.5.1')!;
    expect(selected.length).toBe(2);
    expect(unwrap(selected[0]).elementIdentifier).toBe('given_name');
    expect(unwrap(selected[1]).elementIdentifier).toBe('family_name');

    expect(unwrap(selected[0]).elementValue).toBe('John');
    expect(unwrap(selected[1]).elementValue).toBe('Doe');

    expect(document.deviceSigned).toBeDefined();
  });
});
