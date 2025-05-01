# How to Verify Custom Namespace

Mobile Driver's License (mDOC) contains namespaces that can store various data elements. This document explains how to define and verify your own custom namespace.

## Overview

The mDOC verification process consists of the following steps:

1. Defining a custom namespace
2. Defining a Zod schema for data parsing
3. Instantiating a verification handler and executing the verification

Details for each step are as follows.

## 1. Define Custom Namespace

A namespace is a unique identifier used to identify a collection of specific data elements. Custom namespaces are typically defined in reverse domain name format (e.g., `com.example.organization.document`).

Here is an example of a custom namespace:

```json
{
  "com.example.xxxxxx.xxxxx": {
    "name": {},
    "age": {},
    "company_name": {},
    "deploy": {},
    "date_of_employment": {}
  }
}
```

Each key within the namespace represents a data element, and its value is an object containing additional information related to that data element. Typically, this object includes the type of the data element and other metadata.

## 2. Define Zod Schema for Parsing

To correctly parse and handle mDOC data in a type-safe manner, you need to define a [Zod](https://github.com/colinhacks/zod) schema. Zod is a schema declaration and validation library for TypeScript.

> [!NOTE]
> Use the special `DateOnly` or `DateTime` classes for date data.
>
> - **DateTime**: Represents CBOR tag 0 (`yyyy-MM-ddTHH:mm:ssZ` format).
> - **DateOnly**: Represents CBOR tag 1004 (`yyyy-MM-dd` format).

Here is an example of a Zod schema corresponding to the custom namespace above:

```typescript
import { z } from 'zod';
import { DateOnly } from 'mdoc-cbor-ts';

const exampleSchema = z.object({
  name: z.string(),
  age: z.number(),
  company_name: z.string(),
  deploy: z.string(),
  date_of_employment: z.instanceof(DateOnly),
});

// You can also generate TypeScript type definitions
type ExampleData = z.infer<typeof exampleSchema>;
```

## 3. Instantiate the Verification Handler and Execute Verification

Create an instance of the `MdocVerifyHandlerImpl` class to perform mDOC verification using the defined Zod schema.

```typescript
import { MdocVerifyHandlerImpl } from 'mdoc-cbor-ts';

// Define the mapping between namespaces and schemas
const nameSpaceSchemas = {
  'com.example.xxxxxx.xxxxx': exampleSchema,
  // Add schemas for other namespaces as needed
};

// Create an instance of the verification handler
const mdocVerifyHandler = new MdocVerifyHandlerImpl(nameSpaceSchemas);

// Execute mDOC verification
async function verifyMdoc(mdocString) {
  try {
    const { valid, documents } = await mdocVerifyHandler.verify(mdocString);

    if (!valid) {
      throw new Error('Verification failed');
    }

    // If verification is successful, access the namespace data
    // documents[0] is the first document, docType is the document type
    const { name, age, company_name, deploy, date_of_employment } =
      documents[0]['docType']['com.example.xxxxxx.xxxxx'];

    console.log(`Name: ${name}`);
    console.log(`Age: ${age}`);
    console.log(`Company Name: ${company_name}`);
    console.log(`Department: ${deploy}`);
    console.log(`Employment Date: ${date_of_employment.toISOString()}`); // Convert DateOnly to string

    return { name, age, company_name, deploy, date_of_employment };
  } catch (error) {
    console.error('An error occurred during mDOC verification:', error);
    throw error;
  }
}

// Example usage
const mdocString = 'o2d2ZXJzaW9uYzEuM......'; // Base64 encoded mDOC string
verifyMdoc(mdocString)
  .then((data) => {
    // Use the verified data
  })
  .catch((error) => {
    // Error handling
  });
```

### Error Handling

Common errors that may occur during the verification process include:

1. **Invalid mDOC format**: When the mDOC string has an invalid format
2. **Signature verification error**: When the issuer's signature is invalid
3. **Schema validation error**: When the data does not match the Zod schema

It is recommended to implement appropriate error handling to address these situations.

## Advanced Usage Examples

### Verifying Multiple Namespaces

An mDOC may contain multiple namespaces. To verify all namespaces, define a schema for each and add them to the `nameSpaceSchemas` object.

```typescript
import { MdocVerifyHandlerImpl } from 'mdoc-cbor-ts';
import { z } from 'zod';
import { DateOnly, DateTime } from 'mdoc-cbor-ts';

const employeeSchema = z.object({
  // Employee data schema
});

const idCardSchema = z.object({
  // ID card data schema
});

const nameSpaceSchemas = {
  'com.example.company.employee': employeeSchema,
  'com.example.company.idcard': idCardSchema,
};

const mdocVerifyHandler = new MdocVerifyHandlerImpl(nameSpaceSchemas);
// ...
```

### Adding Custom Validation Logic

You can implement additional validation logic using Zod schemas:

```typescript
import { z } from 'zod';
import { DateOnly } from 'mdoc-cbor-ts';

const employeeSchema = z
  .object({
    name: z.string().min(2).max(100),
    age: z.number().min(18).max(100),
    company_name: z.string(),
    deploy: z.string(),
    date_of_employment: z.instanceof(DateOnly),
  })
  .refine(
    (data) => {
      // Ensure that the employment date is before today
      const today = new Date();
      return data.date_of_employment < today;
    },
    {
      message: 'Employment date must be before today',
      path: ['date_of_employment'],
    }
  );
```

## Summary

This guide explained how to define custom namespaces, create Zod schemas, and verify mDOCs using the `mdoc-cbor-ts` library. By following these steps, you can safely verify and process mDOCs in your own applications.
