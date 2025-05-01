/**
 * Type alias for a function that creates objects from arguments
 * @description
 * A generic type alias that defines a function signature for creating objects.
 * It takes arguments of type T and returns a function of type U.
 * This type is used to define the shape of builder functions that transform
 * input parameters into functions.
 *
 * @example
 * ```typescript
 * type CreateUserArgs = {
 *   name: string;
 *   age: number;
 * };
 *
 * type UserFunction = (id: string) => {
 *   id: string;
 *   name: string;
 *   age: number;
 *   createdAt: Date;
 * };
 *
 * const createUser: CreateBuilderFunction<CreateUserArgs, UserFunction> = (args) => (id) => ({
 *   id,
 *   name: args.name,
 *   age: args.age,
 *   createdAt: new Date()
 * });
 * ```
 */
export type CreateBuilderFunction<T, U> = (args: T) => U;
