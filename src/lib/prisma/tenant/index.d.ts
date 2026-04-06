
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model user
 * 
 */
export type user = $Result.DefaultSelection<Prisma.$userPayload>
/**
 * Model Chamado
 * 
 */
export type Chamado = $Result.DefaultSelection<Prisma.$ChamadoPayload>
/**
 * Model cpfs
 * 
 */
export type cpfs = $Result.DefaultSelection<Prisma.$cpfsPayload>
/**
 * Model tickets_fechados
 * 
 */
export type tickets_fechados = $Result.DefaultSelection<Prisma.$tickets_fechadosPayload>
/**
 * Model avisos
 * 
 */
export type avisos = $Result.DefaultSelection<Prisma.$avisosPayload>
/**
 * Model resumoPersona
 * 
 */
export type resumoPersona = $Result.DefaultSelection<Prisma.$resumoPersonaPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const ROLE: {
  GOD: 'GOD',
  ADMIN: 'ADMIN',
  GESTOR: 'GESTOR',
  ATENDENTE: 'ATENDENTE'
};

export type ROLE = (typeof ROLE)[keyof typeof ROLE]

}

export type ROLE = $Enums.ROLE

export const ROLE: typeof $Enums.ROLE

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **user** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.userDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.chamado`: Exposes CRUD operations for the **Chamado** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Chamados
    * const chamados = await prisma.chamado.findMany()
    * ```
    */
  get chamado(): Prisma.ChamadoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.cpfs`: Exposes CRUD operations for the **cpfs** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Cpfs
    * const cpfs = await prisma.cpfs.findMany()
    * ```
    */
  get cpfs(): Prisma.cpfsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tickets_fechados`: Exposes CRUD operations for the **tickets_fechados** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tickets_fechados
    * const tickets_fechados = await prisma.tickets_fechados.findMany()
    * ```
    */
  get tickets_fechados(): Prisma.tickets_fechadosDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.avisos`: Exposes CRUD operations for the **avisos** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Avisos
    * const avisos = await prisma.avisos.findMany()
    * ```
    */
  get avisos(): Prisma.avisosDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.resumoPersona`: Exposes CRUD operations for the **resumoPersona** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ResumoPersonas
    * const resumoPersonas = await prisma.resumoPersona.findMany()
    * ```
    */
  get resumoPersona(): Prisma.resumoPersonaDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.4.1
   * Query Engine version: 55ae170b1ced7fc6ed07a15f110549408c501bb3
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    user: 'user',
    Chamado: 'Chamado',
    cpfs: 'cpfs',
    tickets_fechados: 'tickets_fechados',
    avisos: 'avisos',
    resumoPersona: 'resumoPersona'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "chamado" | "cpfs" | "tickets_fechados" | "avisos" | "resumoPersona"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      user: {
        payload: Prisma.$userPayload<ExtArgs>
        fields: Prisma.userFieldRefs
        operations: {
          findUnique: {
            args: Prisma.userFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.userFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPayload>
          }
          findFirst: {
            args: Prisma.userFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.userFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPayload>
          }
          findMany: {
            args: Prisma.userFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPayload>[]
          }
          create: {
            args: Prisma.userCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPayload>
          }
          createMany: {
            args: Prisma.userCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.userCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPayload>[]
          }
          delete: {
            args: Prisma.userDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPayload>
          }
          update: {
            args: Prisma.userUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPayload>
          }
          deleteMany: {
            args: Prisma.userDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.userUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.userUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPayload>[]
          }
          upsert: {
            args: Prisma.userUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$userPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.userGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.userCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Chamado: {
        payload: Prisma.$ChamadoPayload<ExtArgs>
        fields: Prisma.ChamadoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ChamadoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChamadoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ChamadoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChamadoPayload>
          }
          findFirst: {
            args: Prisma.ChamadoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChamadoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ChamadoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChamadoPayload>
          }
          findMany: {
            args: Prisma.ChamadoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChamadoPayload>[]
          }
          create: {
            args: Prisma.ChamadoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChamadoPayload>
          }
          createMany: {
            args: Prisma.ChamadoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ChamadoCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChamadoPayload>[]
          }
          delete: {
            args: Prisma.ChamadoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChamadoPayload>
          }
          update: {
            args: Prisma.ChamadoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChamadoPayload>
          }
          deleteMany: {
            args: Prisma.ChamadoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ChamadoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ChamadoUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChamadoPayload>[]
          }
          upsert: {
            args: Prisma.ChamadoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChamadoPayload>
          }
          aggregate: {
            args: Prisma.ChamadoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateChamado>
          }
          groupBy: {
            args: Prisma.ChamadoGroupByArgs<ExtArgs>
            result: $Utils.Optional<ChamadoGroupByOutputType>[]
          }
          count: {
            args: Prisma.ChamadoCountArgs<ExtArgs>
            result: $Utils.Optional<ChamadoCountAggregateOutputType> | number
          }
        }
      }
      cpfs: {
        payload: Prisma.$cpfsPayload<ExtArgs>
        fields: Prisma.cpfsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.cpfsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$cpfsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.cpfsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$cpfsPayload>
          }
          findFirst: {
            args: Prisma.cpfsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$cpfsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.cpfsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$cpfsPayload>
          }
          findMany: {
            args: Prisma.cpfsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$cpfsPayload>[]
          }
          create: {
            args: Prisma.cpfsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$cpfsPayload>
          }
          createMany: {
            args: Prisma.cpfsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.cpfsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$cpfsPayload>[]
          }
          delete: {
            args: Prisma.cpfsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$cpfsPayload>
          }
          update: {
            args: Prisma.cpfsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$cpfsPayload>
          }
          deleteMany: {
            args: Prisma.cpfsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.cpfsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.cpfsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$cpfsPayload>[]
          }
          upsert: {
            args: Prisma.cpfsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$cpfsPayload>
          }
          aggregate: {
            args: Prisma.CpfsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateCpfs>
          }
          groupBy: {
            args: Prisma.cpfsGroupByArgs<ExtArgs>
            result: $Utils.Optional<CpfsGroupByOutputType>[]
          }
          count: {
            args: Prisma.cpfsCountArgs<ExtArgs>
            result: $Utils.Optional<CpfsCountAggregateOutputType> | number
          }
        }
      }
      tickets_fechados: {
        payload: Prisma.$tickets_fechadosPayload<ExtArgs>
        fields: Prisma.tickets_fechadosFieldRefs
        operations: {
          findUnique: {
            args: Prisma.tickets_fechadosFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tickets_fechadosPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.tickets_fechadosFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tickets_fechadosPayload>
          }
          findFirst: {
            args: Prisma.tickets_fechadosFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tickets_fechadosPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.tickets_fechadosFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tickets_fechadosPayload>
          }
          findMany: {
            args: Prisma.tickets_fechadosFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tickets_fechadosPayload>[]
          }
          create: {
            args: Prisma.tickets_fechadosCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tickets_fechadosPayload>
          }
          createMany: {
            args: Prisma.tickets_fechadosCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.tickets_fechadosCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tickets_fechadosPayload>[]
          }
          delete: {
            args: Prisma.tickets_fechadosDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tickets_fechadosPayload>
          }
          update: {
            args: Prisma.tickets_fechadosUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tickets_fechadosPayload>
          }
          deleteMany: {
            args: Prisma.tickets_fechadosDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.tickets_fechadosUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.tickets_fechadosUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tickets_fechadosPayload>[]
          }
          upsert: {
            args: Prisma.tickets_fechadosUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tickets_fechadosPayload>
          }
          aggregate: {
            args: Prisma.Tickets_fechadosAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTickets_fechados>
          }
          groupBy: {
            args: Prisma.tickets_fechadosGroupByArgs<ExtArgs>
            result: $Utils.Optional<Tickets_fechadosGroupByOutputType>[]
          }
          count: {
            args: Prisma.tickets_fechadosCountArgs<ExtArgs>
            result: $Utils.Optional<Tickets_fechadosCountAggregateOutputType> | number
          }
        }
      }
      avisos: {
        payload: Prisma.$avisosPayload<ExtArgs>
        fields: Prisma.avisosFieldRefs
        operations: {
          findUnique: {
            args: Prisma.avisosFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$avisosPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.avisosFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$avisosPayload>
          }
          findFirst: {
            args: Prisma.avisosFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$avisosPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.avisosFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$avisosPayload>
          }
          findMany: {
            args: Prisma.avisosFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$avisosPayload>[]
          }
          create: {
            args: Prisma.avisosCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$avisosPayload>
          }
          createMany: {
            args: Prisma.avisosCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.avisosCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$avisosPayload>[]
          }
          delete: {
            args: Prisma.avisosDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$avisosPayload>
          }
          update: {
            args: Prisma.avisosUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$avisosPayload>
          }
          deleteMany: {
            args: Prisma.avisosDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.avisosUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.avisosUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$avisosPayload>[]
          }
          upsert: {
            args: Prisma.avisosUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$avisosPayload>
          }
          aggregate: {
            args: Prisma.AvisosAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAvisos>
          }
          groupBy: {
            args: Prisma.avisosGroupByArgs<ExtArgs>
            result: $Utils.Optional<AvisosGroupByOutputType>[]
          }
          count: {
            args: Prisma.avisosCountArgs<ExtArgs>
            result: $Utils.Optional<AvisosCountAggregateOutputType> | number
          }
        }
      }
      resumoPersona: {
        payload: Prisma.$resumoPersonaPayload<ExtArgs>
        fields: Prisma.resumoPersonaFieldRefs
        operations: {
          findUnique: {
            args: Prisma.resumoPersonaFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$resumoPersonaPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.resumoPersonaFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$resumoPersonaPayload>
          }
          findFirst: {
            args: Prisma.resumoPersonaFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$resumoPersonaPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.resumoPersonaFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$resumoPersonaPayload>
          }
          findMany: {
            args: Prisma.resumoPersonaFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$resumoPersonaPayload>[]
          }
          create: {
            args: Prisma.resumoPersonaCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$resumoPersonaPayload>
          }
          createMany: {
            args: Prisma.resumoPersonaCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.resumoPersonaCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$resumoPersonaPayload>[]
          }
          delete: {
            args: Prisma.resumoPersonaDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$resumoPersonaPayload>
          }
          update: {
            args: Prisma.resumoPersonaUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$resumoPersonaPayload>
          }
          deleteMany: {
            args: Prisma.resumoPersonaDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.resumoPersonaUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.resumoPersonaUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$resumoPersonaPayload>[]
          }
          upsert: {
            args: Prisma.resumoPersonaUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$resumoPersonaPayload>
          }
          aggregate: {
            args: Prisma.ResumoPersonaAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateResumoPersona>
          }
          groupBy: {
            args: Prisma.resumoPersonaGroupByArgs<ExtArgs>
            result: $Utils.Optional<ResumoPersonaGroupByOutputType>[]
          }
          count: {
            args: Prisma.resumoPersonaCountArgs<ExtArgs>
            result: $Utils.Optional<ResumoPersonaCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    user?: userOmit
    chamado?: ChamadoOmit
    cpfs?: cpfsOmit
    tickets_fechados?: tickets_fechadosOmit
    avisos?: avisosOmit
    resumoPersona?: resumoPersonaOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    chamados: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    chamados?: boolean | UserCountOutputTypeCountChamadosArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountChamadosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ChamadoWhereInput
  }


  /**
   * Models
   */

  /**
   * Model user
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    email: string | null
    cpf: string | null
    name: string | null
    role: $Enums.ROLE | null
    avatarUrl: string | null
    setor: string | null
    resumo: string | null
    password: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    email: string | null
    cpf: string | null
    name: string | null
    role: $Enums.ROLE | null
    avatarUrl: string | null
    setor: string | null
    resumo: string | null
    password: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    email: number
    cpf: number
    name: number
    role: number
    avatarUrl: number
    setor: number
    resumo: number
    password: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    email?: true
    cpf?: true
    name?: true
    role?: true
    avatarUrl?: true
    setor?: true
    resumo?: true
    password?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    email?: true
    cpf?: true
    name?: true
    role?: true
    avatarUrl?: true
    setor?: true
    resumo?: true
    password?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    email?: true
    cpf?: true
    name?: true
    role?: true
    avatarUrl?: true
    setor?: true
    resumo?: true
    password?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which user to aggregate.
     */
    where?: userWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: userOrderByWithRelationInput | userOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: userWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type userGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: userWhereInput
    orderBy?: userOrderByWithAggregationInput | userOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: userScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    email: string
    cpf: string
    name: string
    role: $Enums.ROLE
    avatarUrl: string | null
    setor: string
    resumo: string | null
    password: string
    createdAt: Date
    updatedAt: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends userGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type userSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    cpf?: boolean
    name?: boolean
    role?: boolean
    avatarUrl?: boolean
    setor?: boolean
    resumo?: boolean
    password?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    chamados?: boolean | user$chamadosArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type userSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    cpf?: boolean
    name?: boolean
    role?: boolean
    avatarUrl?: boolean
    setor?: boolean
    resumo?: boolean
    password?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type userSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    email?: boolean
    cpf?: boolean
    name?: boolean
    role?: boolean
    avatarUrl?: boolean
    setor?: boolean
    resumo?: boolean
    password?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["user"]>

  export type userSelectScalar = {
    id?: boolean
    email?: boolean
    cpf?: boolean
    name?: boolean
    role?: boolean
    avatarUrl?: boolean
    setor?: boolean
    resumo?: boolean
    password?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type userOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "email" | "cpf" | "name" | "role" | "avatarUrl" | "setor" | "resumo" | "password" | "createdAt" | "updatedAt", ExtArgs["result"]["user"]>
  export type userInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    chamados?: boolean | user$chamadosArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type userIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type userIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $userPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "user"
    objects: {
      chamados: Prisma.$ChamadoPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      email: string
      cpf: string
      name: string
      role: $Enums.ROLE
      avatarUrl: string | null
      setor: string
      resumo: string | null
      password: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type userGetPayload<S extends boolean | null | undefined | userDefaultArgs> = $Result.GetResult<Prisma.$userPayload, S>

  type userCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<userFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface userDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['user'], meta: { name: 'user' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {userFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends userFindUniqueArgs>(args: SelectSubset<T, userFindUniqueArgs<ExtArgs>>): Prisma__userClient<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {userFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends userFindUniqueOrThrowArgs>(args: SelectSubset<T, userFindUniqueOrThrowArgs<ExtArgs>>): Prisma__userClient<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {userFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends userFindFirstArgs>(args?: SelectSubset<T, userFindFirstArgs<ExtArgs>>): Prisma__userClient<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {userFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends userFindFirstOrThrowArgs>(args?: SelectSubset<T, userFindFirstOrThrowArgs<ExtArgs>>): Prisma__userClient<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {userFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends userFindManyArgs>(args?: SelectSubset<T, userFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {userCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends userCreateArgs>(args: SelectSubset<T, userCreateArgs<ExtArgs>>): Prisma__userClient<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {userCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends userCreateManyArgs>(args?: SelectSubset<T, userCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {userCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends userCreateManyAndReturnArgs>(args?: SelectSubset<T, userCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {userDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends userDeleteArgs>(args: SelectSubset<T, userDeleteArgs<ExtArgs>>): Prisma__userClient<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {userUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends userUpdateArgs>(args: SelectSubset<T, userUpdateArgs<ExtArgs>>): Prisma__userClient<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {userDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends userDeleteManyArgs>(args?: SelectSubset<T, userDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {userUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends userUpdateManyArgs>(args: SelectSubset<T, userUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {userUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends userUpdateManyAndReturnArgs>(args: SelectSubset<T, userUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {userUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends userUpsertArgs>(args: SelectSubset<T, userUpsertArgs<ExtArgs>>): Prisma__userClient<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {userCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends userCountArgs>(
      args?: Subset<T, userCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {userGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends userGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: userGroupByArgs['orderBy'] }
        : { orderBy?: userGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, userGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the user model
   */
  readonly fields: userFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for user.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__userClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    chamados<T extends user$chamadosArgs<ExtArgs> = {}>(args?: Subset<T, user$chamadosArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChamadoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the user model
   */
  interface userFieldRefs {
    readonly id: FieldRef<"user", 'String'>
    readonly email: FieldRef<"user", 'String'>
    readonly cpf: FieldRef<"user", 'String'>
    readonly name: FieldRef<"user", 'String'>
    readonly role: FieldRef<"user", 'ROLE'>
    readonly avatarUrl: FieldRef<"user", 'String'>
    readonly setor: FieldRef<"user", 'String'>
    readonly resumo: FieldRef<"user", 'String'>
    readonly password: FieldRef<"user", 'String'>
    readonly createdAt: FieldRef<"user", 'DateTime'>
    readonly updatedAt: FieldRef<"user", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * user findUnique
   */
  export type userFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
    /**
     * Filter, which user to fetch.
     */
    where: userWhereUniqueInput
  }

  /**
   * user findUniqueOrThrow
   */
  export type userFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
    /**
     * Filter, which user to fetch.
     */
    where: userWhereUniqueInput
  }

  /**
   * user findFirst
   */
  export type userFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
    /**
     * Filter, which user to fetch.
     */
    where?: userWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: userOrderByWithRelationInput | userOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for users.
     */
    cursor?: userWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * user findFirstOrThrow
   */
  export type userFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
    /**
     * Filter, which user to fetch.
     */
    where?: userWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: userOrderByWithRelationInput | userOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for users.
     */
    cursor?: userWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * user findMany
   */
  export type userFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
    /**
     * Filter, which users to fetch.
     */
    where?: userWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of users to fetch.
     */
    orderBy?: userOrderByWithRelationInput | userOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing users.
     */
    cursor?: userWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * user create
   */
  export type userCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
    /**
     * The data needed to create a user.
     */
    data: XOR<userCreateInput, userUncheckedCreateInput>
  }

  /**
   * user createMany
   */
  export type userCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many users.
     */
    data: userCreateManyInput | userCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * user createManyAndReturn
   */
  export type userCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * The data used to create many users.
     */
    data: userCreateManyInput | userCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * user update
   */
  export type userUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
    /**
     * The data needed to update a user.
     */
    data: XOR<userUpdateInput, userUncheckedUpdateInput>
    /**
     * Choose, which user to update.
     */
    where: userWhereUniqueInput
  }

  /**
   * user updateMany
   */
  export type userUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update users.
     */
    data: XOR<userUpdateManyMutationInput, userUncheckedUpdateManyInput>
    /**
     * Filter which users to update
     */
    where?: userWhereInput
    /**
     * Limit how many users to update.
     */
    limit?: number
  }

  /**
   * user updateManyAndReturn
   */
  export type userUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * The data used to update users.
     */
    data: XOR<userUpdateManyMutationInput, userUncheckedUpdateManyInput>
    /**
     * Filter which users to update
     */
    where?: userWhereInput
    /**
     * Limit how many users to update.
     */
    limit?: number
  }

  /**
   * user upsert
   */
  export type userUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
    /**
     * The filter to search for the user to update in case it exists.
     */
    where: userWhereUniqueInput
    /**
     * In case the user found by the `where` argument doesn't exist, create a new user with this data.
     */
    create: XOR<userCreateInput, userUncheckedCreateInput>
    /**
     * In case the user was found with the provided `where` argument, update it with this data.
     */
    update: XOR<userUpdateInput, userUncheckedUpdateInput>
  }

  /**
   * user delete
   */
  export type userDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
    /**
     * Filter which user to delete.
     */
    where: userWhereUniqueInput
  }

  /**
   * user deleteMany
   */
  export type userDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which users to delete
     */
    where?: userWhereInput
    /**
     * Limit how many users to delete.
     */
    limit?: number
  }

  /**
   * user.chamados
   */
  export type user$chamadosArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Chamado
     */
    select?: ChamadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Chamado
     */
    omit?: ChamadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChamadoInclude<ExtArgs> | null
    where?: ChamadoWhereInput
    orderBy?: ChamadoOrderByWithRelationInput | ChamadoOrderByWithRelationInput[]
    cursor?: ChamadoWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ChamadoScalarFieldEnum | ChamadoScalarFieldEnum[]
  }

  /**
   * user without action
   */
  export type userDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
  }


  /**
   * Model Chamado
   */

  export type AggregateChamado = {
    _count: ChamadoCountAggregateOutputType | null
    _min: ChamadoMinAggregateOutputType | null
    _max: ChamadoMaxAggregateOutputType | null
  }

  export type ChamadoMinAggregateOutputType = {
    id: string | null
    ticket: string | null
    nome: string | null
    cpf: string | null
    setor: string | null
    descricao: string | null
    historico: string | null
    status: string | null
    prioridade: string | null
    anexoUrl: string | null
    atendenteId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ChamadoMaxAggregateOutputType = {
    id: string | null
    ticket: string | null
    nome: string | null
    cpf: string | null
    setor: string | null
    descricao: string | null
    historico: string | null
    status: string | null
    prioridade: string | null
    anexoUrl: string | null
    atendenteId: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ChamadoCountAggregateOutputType = {
    id: number
    ticket: number
    nome: number
    cpf: number
    setor: number
    descricao: number
    historico: number
    status: number
    prioridade: number
    anexoUrl: number
    atendenteId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ChamadoMinAggregateInputType = {
    id?: true
    ticket?: true
    nome?: true
    cpf?: true
    setor?: true
    descricao?: true
    historico?: true
    status?: true
    prioridade?: true
    anexoUrl?: true
    atendenteId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ChamadoMaxAggregateInputType = {
    id?: true
    ticket?: true
    nome?: true
    cpf?: true
    setor?: true
    descricao?: true
    historico?: true
    status?: true
    prioridade?: true
    anexoUrl?: true
    atendenteId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ChamadoCountAggregateInputType = {
    id?: true
    ticket?: true
    nome?: true
    cpf?: true
    setor?: true
    descricao?: true
    historico?: true
    status?: true
    prioridade?: true
    anexoUrl?: true
    atendenteId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ChamadoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Chamado to aggregate.
     */
    where?: ChamadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Chamados to fetch.
     */
    orderBy?: ChamadoOrderByWithRelationInput | ChamadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ChamadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Chamados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Chamados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Chamados
    **/
    _count?: true | ChamadoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ChamadoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ChamadoMaxAggregateInputType
  }

  export type GetChamadoAggregateType<T extends ChamadoAggregateArgs> = {
        [P in keyof T & keyof AggregateChamado]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateChamado[P]>
      : GetScalarType<T[P], AggregateChamado[P]>
  }




  export type ChamadoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ChamadoWhereInput
    orderBy?: ChamadoOrderByWithAggregationInput | ChamadoOrderByWithAggregationInput[]
    by: ChamadoScalarFieldEnum[] | ChamadoScalarFieldEnum
    having?: ChamadoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ChamadoCountAggregateInputType | true
    _min?: ChamadoMinAggregateInputType
    _max?: ChamadoMaxAggregateInputType
  }

  export type ChamadoGroupByOutputType = {
    id: string
    ticket: string
    nome: string
    cpf: string
    setor: string
    descricao: string
    historico: string | null
    status: string
    prioridade: string
    anexoUrl: string | null
    atendenteId: string | null
    createdAt: Date
    updatedAt: Date
    _count: ChamadoCountAggregateOutputType | null
    _min: ChamadoMinAggregateOutputType | null
    _max: ChamadoMaxAggregateOutputType | null
  }

  type GetChamadoGroupByPayload<T extends ChamadoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ChamadoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ChamadoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ChamadoGroupByOutputType[P]>
            : GetScalarType<T[P], ChamadoGroupByOutputType[P]>
        }
      >
    >


  export type ChamadoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ticket?: boolean
    nome?: boolean
    cpf?: boolean
    setor?: boolean
    descricao?: boolean
    historico?: boolean
    status?: boolean
    prioridade?: boolean
    anexoUrl?: boolean
    atendenteId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    atendente?: boolean | Chamado$atendenteArgs<ExtArgs>
  }, ExtArgs["result"]["chamado"]>

  export type ChamadoSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ticket?: boolean
    nome?: boolean
    cpf?: boolean
    setor?: boolean
    descricao?: boolean
    historico?: boolean
    status?: boolean
    prioridade?: boolean
    anexoUrl?: boolean
    atendenteId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    atendente?: boolean | Chamado$atendenteArgs<ExtArgs>
  }, ExtArgs["result"]["chamado"]>

  export type ChamadoSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ticket?: boolean
    nome?: boolean
    cpf?: boolean
    setor?: boolean
    descricao?: boolean
    historico?: boolean
    status?: boolean
    prioridade?: boolean
    anexoUrl?: boolean
    atendenteId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    atendente?: boolean | Chamado$atendenteArgs<ExtArgs>
  }, ExtArgs["result"]["chamado"]>

  export type ChamadoSelectScalar = {
    id?: boolean
    ticket?: boolean
    nome?: boolean
    cpf?: boolean
    setor?: boolean
    descricao?: boolean
    historico?: boolean
    status?: boolean
    prioridade?: boolean
    anexoUrl?: boolean
    atendenteId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ChamadoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "ticket" | "nome" | "cpf" | "setor" | "descricao" | "historico" | "status" | "prioridade" | "anexoUrl" | "atendenteId" | "createdAt" | "updatedAt", ExtArgs["result"]["chamado"]>
  export type ChamadoInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    atendente?: boolean | Chamado$atendenteArgs<ExtArgs>
  }
  export type ChamadoIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    atendente?: boolean | Chamado$atendenteArgs<ExtArgs>
  }
  export type ChamadoIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    atendente?: boolean | Chamado$atendenteArgs<ExtArgs>
  }

  export type $ChamadoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Chamado"
    objects: {
      atendente: Prisma.$userPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      ticket: string
      nome: string
      cpf: string
      setor: string
      descricao: string
      historico: string | null
      status: string
      prioridade: string
      anexoUrl: string | null
      atendenteId: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["chamado"]>
    composites: {}
  }

  type ChamadoGetPayload<S extends boolean | null | undefined | ChamadoDefaultArgs> = $Result.GetResult<Prisma.$ChamadoPayload, S>

  type ChamadoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ChamadoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ChamadoCountAggregateInputType | true
    }

  export interface ChamadoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Chamado'], meta: { name: 'Chamado' } }
    /**
     * Find zero or one Chamado that matches the filter.
     * @param {ChamadoFindUniqueArgs} args - Arguments to find a Chamado
     * @example
     * // Get one Chamado
     * const chamado = await prisma.chamado.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ChamadoFindUniqueArgs>(args: SelectSubset<T, ChamadoFindUniqueArgs<ExtArgs>>): Prisma__ChamadoClient<$Result.GetResult<Prisma.$ChamadoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Chamado that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ChamadoFindUniqueOrThrowArgs} args - Arguments to find a Chamado
     * @example
     * // Get one Chamado
     * const chamado = await prisma.chamado.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ChamadoFindUniqueOrThrowArgs>(args: SelectSubset<T, ChamadoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ChamadoClient<$Result.GetResult<Prisma.$ChamadoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Chamado that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChamadoFindFirstArgs} args - Arguments to find a Chamado
     * @example
     * // Get one Chamado
     * const chamado = await prisma.chamado.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ChamadoFindFirstArgs>(args?: SelectSubset<T, ChamadoFindFirstArgs<ExtArgs>>): Prisma__ChamadoClient<$Result.GetResult<Prisma.$ChamadoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Chamado that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChamadoFindFirstOrThrowArgs} args - Arguments to find a Chamado
     * @example
     * // Get one Chamado
     * const chamado = await prisma.chamado.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ChamadoFindFirstOrThrowArgs>(args?: SelectSubset<T, ChamadoFindFirstOrThrowArgs<ExtArgs>>): Prisma__ChamadoClient<$Result.GetResult<Prisma.$ChamadoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Chamados that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChamadoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Chamados
     * const chamados = await prisma.chamado.findMany()
     * 
     * // Get first 10 Chamados
     * const chamados = await prisma.chamado.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const chamadoWithIdOnly = await prisma.chamado.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ChamadoFindManyArgs>(args?: SelectSubset<T, ChamadoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChamadoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Chamado.
     * @param {ChamadoCreateArgs} args - Arguments to create a Chamado.
     * @example
     * // Create one Chamado
     * const Chamado = await prisma.chamado.create({
     *   data: {
     *     // ... data to create a Chamado
     *   }
     * })
     * 
     */
    create<T extends ChamadoCreateArgs>(args: SelectSubset<T, ChamadoCreateArgs<ExtArgs>>): Prisma__ChamadoClient<$Result.GetResult<Prisma.$ChamadoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Chamados.
     * @param {ChamadoCreateManyArgs} args - Arguments to create many Chamados.
     * @example
     * // Create many Chamados
     * const chamado = await prisma.chamado.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ChamadoCreateManyArgs>(args?: SelectSubset<T, ChamadoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Chamados and returns the data saved in the database.
     * @param {ChamadoCreateManyAndReturnArgs} args - Arguments to create many Chamados.
     * @example
     * // Create many Chamados
     * const chamado = await prisma.chamado.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Chamados and only return the `id`
     * const chamadoWithIdOnly = await prisma.chamado.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ChamadoCreateManyAndReturnArgs>(args?: SelectSubset<T, ChamadoCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChamadoPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Chamado.
     * @param {ChamadoDeleteArgs} args - Arguments to delete one Chamado.
     * @example
     * // Delete one Chamado
     * const Chamado = await prisma.chamado.delete({
     *   where: {
     *     // ... filter to delete one Chamado
     *   }
     * })
     * 
     */
    delete<T extends ChamadoDeleteArgs>(args: SelectSubset<T, ChamadoDeleteArgs<ExtArgs>>): Prisma__ChamadoClient<$Result.GetResult<Prisma.$ChamadoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Chamado.
     * @param {ChamadoUpdateArgs} args - Arguments to update one Chamado.
     * @example
     * // Update one Chamado
     * const chamado = await prisma.chamado.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ChamadoUpdateArgs>(args: SelectSubset<T, ChamadoUpdateArgs<ExtArgs>>): Prisma__ChamadoClient<$Result.GetResult<Prisma.$ChamadoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Chamados.
     * @param {ChamadoDeleteManyArgs} args - Arguments to filter Chamados to delete.
     * @example
     * // Delete a few Chamados
     * const { count } = await prisma.chamado.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ChamadoDeleteManyArgs>(args?: SelectSubset<T, ChamadoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Chamados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChamadoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Chamados
     * const chamado = await prisma.chamado.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ChamadoUpdateManyArgs>(args: SelectSubset<T, ChamadoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Chamados and returns the data updated in the database.
     * @param {ChamadoUpdateManyAndReturnArgs} args - Arguments to update many Chamados.
     * @example
     * // Update many Chamados
     * const chamado = await prisma.chamado.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Chamados and only return the `id`
     * const chamadoWithIdOnly = await prisma.chamado.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ChamadoUpdateManyAndReturnArgs>(args: SelectSubset<T, ChamadoUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChamadoPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Chamado.
     * @param {ChamadoUpsertArgs} args - Arguments to update or create a Chamado.
     * @example
     * // Update or create a Chamado
     * const chamado = await prisma.chamado.upsert({
     *   create: {
     *     // ... data to create a Chamado
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Chamado we want to update
     *   }
     * })
     */
    upsert<T extends ChamadoUpsertArgs>(args: SelectSubset<T, ChamadoUpsertArgs<ExtArgs>>): Prisma__ChamadoClient<$Result.GetResult<Prisma.$ChamadoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Chamados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChamadoCountArgs} args - Arguments to filter Chamados to count.
     * @example
     * // Count the number of Chamados
     * const count = await prisma.chamado.count({
     *   where: {
     *     // ... the filter for the Chamados we want to count
     *   }
     * })
    **/
    count<T extends ChamadoCountArgs>(
      args?: Subset<T, ChamadoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ChamadoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Chamado.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChamadoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ChamadoAggregateArgs>(args: Subset<T, ChamadoAggregateArgs>): Prisma.PrismaPromise<GetChamadoAggregateType<T>>

    /**
     * Group by Chamado.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChamadoGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ChamadoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ChamadoGroupByArgs['orderBy'] }
        : { orderBy?: ChamadoGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ChamadoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetChamadoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Chamado model
   */
  readonly fields: ChamadoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Chamado.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ChamadoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    atendente<T extends Chamado$atendenteArgs<ExtArgs> = {}>(args?: Subset<T, Chamado$atendenteArgs<ExtArgs>>): Prisma__userClient<$Result.GetResult<Prisma.$userPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Chamado model
   */
  interface ChamadoFieldRefs {
    readonly id: FieldRef<"Chamado", 'String'>
    readonly ticket: FieldRef<"Chamado", 'String'>
    readonly nome: FieldRef<"Chamado", 'String'>
    readonly cpf: FieldRef<"Chamado", 'String'>
    readonly setor: FieldRef<"Chamado", 'String'>
    readonly descricao: FieldRef<"Chamado", 'String'>
    readonly historico: FieldRef<"Chamado", 'String'>
    readonly status: FieldRef<"Chamado", 'String'>
    readonly prioridade: FieldRef<"Chamado", 'String'>
    readonly anexoUrl: FieldRef<"Chamado", 'String'>
    readonly atendenteId: FieldRef<"Chamado", 'String'>
    readonly createdAt: FieldRef<"Chamado", 'DateTime'>
    readonly updatedAt: FieldRef<"Chamado", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Chamado findUnique
   */
  export type ChamadoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Chamado
     */
    select?: ChamadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Chamado
     */
    omit?: ChamadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChamadoInclude<ExtArgs> | null
    /**
     * Filter, which Chamado to fetch.
     */
    where: ChamadoWhereUniqueInput
  }

  /**
   * Chamado findUniqueOrThrow
   */
  export type ChamadoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Chamado
     */
    select?: ChamadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Chamado
     */
    omit?: ChamadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChamadoInclude<ExtArgs> | null
    /**
     * Filter, which Chamado to fetch.
     */
    where: ChamadoWhereUniqueInput
  }

  /**
   * Chamado findFirst
   */
  export type ChamadoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Chamado
     */
    select?: ChamadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Chamado
     */
    omit?: ChamadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChamadoInclude<ExtArgs> | null
    /**
     * Filter, which Chamado to fetch.
     */
    where?: ChamadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Chamados to fetch.
     */
    orderBy?: ChamadoOrderByWithRelationInput | ChamadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Chamados.
     */
    cursor?: ChamadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Chamados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Chamados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Chamados.
     */
    distinct?: ChamadoScalarFieldEnum | ChamadoScalarFieldEnum[]
  }

  /**
   * Chamado findFirstOrThrow
   */
  export type ChamadoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Chamado
     */
    select?: ChamadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Chamado
     */
    omit?: ChamadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChamadoInclude<ExtArgs> | null
    /**
     * Filter, which Chamado to fetch.
     */
    where?: ChamadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Chamados to fetch.
     */
    orderBy?: ChamadoOrderByWithRelationInput | ChamadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Chamados.
     */
    cursor?: ChamadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Chamados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Chamados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Chamados.
     */
    distinct?: ChamadoScalarFieldEnum | ChamadoScalarFieldEnum[]
  }

  /**
   * Chamado findMany
   */
  export type ChamadoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Chamado
     */
    select?: ChamadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Chamado
     */
    omit?: ChamadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChamadoInclude<ExtArgs> | null
    /**
     * Filter, which Chamados to fetch.
     */
    where?: ChamadoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Chamados to fetch.
     */
    orderBy?: ChamadoOrderByWithRelationInput | ChamadoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Chamados.
     */
    cursor?: ChamadoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Chamados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Chamados.
     */
    skip?: number
    distinct?: ChamadoScalarFieldEnum | ChamadoScalarFieldEnum[]
  }

  /**
   * Chamado create
   */
  export type ChamadoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Chamado
     */
    select?: ChamadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Chamado
     */
    omit?: ChamadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChamadoInclude<ExtArgs> | null
    /**
     * The data needed to create a Chamado.
     */
    data: XOR<ChamadoCreateInput, ChamadoUncheckedCreateInput>
  }

  /**
   * Chamado createMany
   */
  export type ChamadoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Chamados.
     */
    data: ChamadoCreateManyInput | ChamadoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Chamado createManyAndReturn
   */
  export type ChamadoCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Chamado
     */
    select?: ChamadoSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Chamado
     */
    omit?: ChamadoOmit<ExtArgs> | null
    /**
     * The data used to create many Chamados.
     */
    data: ChamadoCreateManyInput | ChamadoCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChamadoIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Chamado update
   */
  export type ChamadoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Chamado
     */
    select?: ChamadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Chamado
     */
    omit?: ChamadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChamadoInclude<ExtArgs> | null
    /**
     * The data needed to update a Chamado.
     */
    data: XOR<ChamadoUpdateInput, ChamadoUncheckedUpdateInput>
    /**
     * Choose, which Chamado to update.
     */
    where: ChamadoWhereUniqueInput
  }

  /**
   * Chamado updateMany
   */
  export type ChamadoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Chamados.
     */
    data: XOR<ChamadoUpdateManyMutationInput, ChamadoUncheckedUpdateManyInput>
    /**
     * Filter which Chamados to update
     */
    where?: ChamadoWhereInput
    /**
     * Limit how many Chamados to update.
     */
    limit?: number
  }

  /**
   * Chamado updateManyAndReturn
   */
  export type ChamadoUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Chamado
     */
    select?: ChamadoSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Chamado
     */
    omit?: ChamadoOmit<ExtArgs> | null
    /**
     * The data used to update Chamados.
     */
    data: XOR<ChamadoUpdateManyMutationInput, ChamadoUncheckedUpdateManyInput>
    /**
     * Filter which Chamados to update
     */
    where?: ChamadoWhereInput
    /**
     * Limit how many Chamados to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChamadoIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Chamado upsert
   */
  export type ChamadoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Chamado
     */
    select?: ChamadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Chamado
     */
    omit?: ChamadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChamadoInclude<ExtArgs> | null
    /**
     * The filter to search for the Chamado to update in case it exists.
     */
    where: ChamadoWhereUniqueInput
    /**
     * In case the Chamado found by the `where` argument doesn't exist, create a new Chamado with this data.
     */
    create: XOR<ChamadoCreateInput, ChamadoUncheckedCreateInput>
    /**
     * In case the Chamado was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ChamadoUpdateInput, ChamadoUncheckedUpdateInput>
  }

  /**
   * Chamado delete
   */
  export type ChamadoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Chamado
     */
    select?: ChamadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Chamado
     */
    omit?: ChamadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChamadoInclude<ExtArgs> | null
    /**
     * Filter which Chamado to delete.
     */
    where: ChamadoWhereUniqueInput
  }

  /**
   * Chamado deleteMany
   */
  export type ChamadoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Chamados to delete
     */
    where?: ChamadoWhereInput
    /**
     * Limit how many Chamados to delete.
     */
    limit?: number
  }

  /**
   * Chamado.atendente
   */
  export type Chamado$atendenteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the user
     */
    select?: userSelect<ExtArgs> | null
    /**
     * Omit specific fields from the user
     */
    omit?: userOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: userInclude<ExtArgs> | null
    where?: userWhereInput
  }

  /**
   * Chamado without action
   */
  export type ChamadoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Chamado
     */
    select?: ChamadoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Chamado
     */
    omit?: ChamadoOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChamadoInclude<ExtArgs> | null
  }


  /**
   * Model cpfs
   */

  export type AggregateCpfs = {
    _count: CpfsCountAggregateOutputType | null
    _min: CpfsMinAggregateOutputType | null
    _max: CpfsMaxAggregateOutputType | null
  }

  export type CpfsMinAggregateOutputType = {
    id: string | null
    cpf: string | null
    nome: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CpfsMaxAggregateOutputType = {
    id: string | null
    cpf: string | null
    nome: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type CpfsCountAggregateOutputType = {
    id: number
    cpf: number
    nome: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type CpfsMinAggregateInputType = {
    id?: true
    cpf?: true
    nome?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CpfsMaxAggregateInputType = {
    id?: true
    cpf?: true
    nome?: true
    createdAt?: true
    updatedAt?: true
  }

  export type CpfsCountAggregateInputType = {
    id?: true
    cpf?: true
    nome?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type CpfsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which cpfs to aggregate.
     */
    where?: cpfsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of cpfs to fetch.
     */
    orderBy?: cpfsOrderByWithRelationInput | cpfsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: cpfsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` cpfs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` cpfs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned cpfs
    **/
    _count?: true | CpfsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: CpfsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: CpfsMaxAggregateInputType
  }

  export type GetCpfsAggregateType<T extends CpfsAggregateArgs> = {
        [P in keyof T & keyof AggregateCpfs]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateCpfs[P]>
      : GetScalarType<T[P], AggregateCpfs[P]>
  }




  export type cpfsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: cpfsWhereInput
    orderBy?: cpfsOrderByWithAggregationInput | cpfsOrderByWithAggregationInput[]
    by: CpfsScalarFieldEnum[] | CpfsScalarFieldEnum
    having?: cpfsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: CpfsCountAggregateInputType | true
    _min?: CpfsMinAggregateInputType
    _max?: CpfsMaxAggregateInputType
  }

  export type CpfsGroupByOutputType = {
    id: string
    cpf: string
    nome: string
    createdAt: Date
    updatedAt: Date
    _count: CpfsCountAggregateOutputType | null
    _min: CpfsMinAggregateOutputType | null
    _max: CpfsMaxAggregateOutputType | null
  }

  type GetCpfsGroupByPayload<T extends cpfsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<CpfsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof CpfsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], CpfsGroupByOutputType[P]>
            : GetScalarType<T[P], CpfsGroupByOutputType[P]>
        }
      >
    >


  export type cpfsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    cpf?: boolean
    nome?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["cpfs"]>

  export type cpfsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    cpf?: boolean
    nome?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["cpfs"]>

  export type cpfsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    cpf?: boolean
    nome?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["cpfs"]>

  export type cpfsSelectScalar = {
    id?: boolean
    cpf?: boolean
    nome?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type cpfsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "cpf" | "nome" | "createdAt" | "updatedAt", ExtArgs["result"]["cpfs"]>

  export type $cpfsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "cpfs"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      cpf: string
      nome: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["cpfs"]>
    composites: {}
  }

  type cpfsGetPayload<S extends boolean | null | undefined | cpfsDefaultArgs> = $Result.GetResult<Prisma.$cpfsPayload, S>

  type cpfsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<cpfsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: CpfsCountAggregateInputType | true
    }

  export interface cpfsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['cpfs'], meta: { name: 'cpfs' } }
    /**
     * Find zero or one Cpfs that matches the filter.
     * @param {cpfsFindUniqueArgs} args - Arguments to find a Cpfs
     * @example
     * // Get one Cpfs
     * const cpfs = await prisma.cpfs.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends cpfsFindUniqueArgs>(args: SelectSubset<T, cpfsFindUniqueArgs<ExtArgs>>): Prisma__cpfsClient<$Result.GetResult<Prisma.$cpfsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Cpfs that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {cpfsFindUniqueOrThrowArgs} args - Arguments to find a Cpfs
     * @example
     * // Get one Cpfs
     * const cpfs = await prisma.cpfs.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends cpfsFindUniqueOrThrowArgs>(args: SelectSubset<T, cpfsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__cpfsClient<$Result.GetResult<Prisma.$cpfsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Cpfs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {cpfsFindFirstArgs} args - Arguments to find a Cpfs
     * @example
     * // Get one Cpfs
     * const cpfs = await prisma.cpfs.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends cpfsFindFirstArgs>(args?: SelectSubset<T, cpfsFindFirstArgs<ExtArgs>>): Prisma__cpfsClient<$Result.GetResult<Prisma.$cpfsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Cpfs that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {cpfsFindFirstOrThrowArgs} args - Arguments to find a Cpfs
     * @example
     * // Get one Cpfs
     * const cpfs = await prisma.cpfs.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends cpfsFindFirstOrThrowArgs>(args?: SelectSubset<T, cpfsFindFirstOrThrowArgs<ExtArgs>>): Prisma__cpfsClient<$Result.GetResult<Prisma.$cpfsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Cpfs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {cpfsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Cpfs
     * const cpfs = await prisma.cpfs.findMany()
     * 
     * // Get first 10 Cpfs
     * const cpfs = await prisma.cpfs.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const cpfsWithIdOnly = await prisma.cpfs.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends cpfsFindManyArgs>(args?: SelectSubset<T, cpfsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$cpfsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Cpfs.
     * @param {cpfsCreateArgs} args - Arguments to create a Cpfs.
     * @example
     * // Create one Cpfs
     * const Cpfs = await prisma.cpfs.create({
     *   data: {
     *     // ... data to create a Cpfs
     *   }
     * })
     * 
     */
    create<T extends cpfsCreateArgs>(args: SelectSubset<T, cpfsCreateArgs<ExtArgs>>): Prisma__cpfsClient<$Result.GetResult<Prisma.$cpfsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Cpfs.
     * @param {cpfsCreateManyArgs} args - Arguments to create many Cpfs.
     * @example
     * // Create many Cpfs
     * const cpfs = await prisma.cpfs.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends cpfsCreateManyArgs>(args?: SelectSubset<T, cpfsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Cpfs and returns the data saved in the database.
     * @param {cpfsCreateManyAndReturnArgs} args - Arguments to create many Cpfs.
     * @example
     * // Create many Cpfs
     * const cpfs = await prisma.cpfs.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Cpfs and only return the `id`
     * const cpfsWithIdOnly = await prisma.cpfs.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends cpfsCreateManyAndReturnArgs>(args?: SelectSubset<T, cpfsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$cpfsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Cpfs.
     * @param {cpfsDeleteArgs} args - Arguments to delete one Cpfs.
     * @example
     * // Delete one Cpfs
     * const Cpfs = await prisma.cpfs.delete({
     *   where: {
     *     // ... filter to delete one Cpfs
     *   }
     * })
     * 
     */
    delete<T extends cpfsDeleteArgs>(args: SelectSubset<T, cpfsDeleteArgs<ExtArgs>>): Prisma__cpfsClient<$Result.GetResult<Prisma.$cpfsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Cpfs.
     * @param {cpfsUpdateArgs} args - Arguments to update one Cpfs.
     * @example
     * // Update one Cpfs
     * const cpfs = await prisma.cpfs.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends cpfsUpdateArgs>(args: SelectSubset<T, cpfsUpdateArgs<ExtArgs>>): Prisma__cpfsClient<$Result.GetResult<Prisma.$cpfsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Cpfs.
     * @param {cpfsDeleteManyArgs} args - Arguments to filter Cpfs to delete.
     * @example
     * // Delete a few Cpfs
     * const { count } = await prisma.cpfs.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends cpfsDeleteManyArgs>(args?: SelectSubset<T, cpfsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Cpfs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {cpfsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Cpfs
     * const cpfs = await prisma.cpfs.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends cpfsUpdateManyArgs>(args: SelectSubset<T, cpfsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Cpfs and returns the data updated in the database.
     * @param {cpfsUpdateManyAndReturnArgs} args - Arguments to update many Cpfs.
     * @example
     * // Update many Cpfs
     * const cpfs = await prisma.cpfs.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Cpfs and only return the `id`
     * const cpfsWithIdOnly = await prisma.cpfs.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends cpfsUpdateManyAndReturnArgs>(args: SelectSubset<T, cpfsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$cpfsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Cpfs.
     * @param {cpfsUpsertArgs} args - Arguments to update or create a Cpfs.
     * @example
     * // Update or create a Cpfs
     * const cpfs = await prisma.cpfs.upsert({
     *   create: {
     *     // ... data to create a Cpfs
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Cpfs we want to update
     *   }
     * })
     */
    upsert<T extends cpfsUpsertArgs>(args: SelectSubset<T, cpfsUpsertArgs<ExtArgs>>): Prisma__cpfsClient<$Result.GetResult<Prisma.$cpfsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Cpfs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {cpfsCountArgs} args - Arguments to filter Cpfs to count.
     * @example
     * // Count the number of Cpfs
     * const count = await prisma.cpfs.count({
     *   where: {
     *     // ... the filter for the Cpfs we want to count
     *   }
     * })
    **/
    count<T extends cpfsCountArgs>(
      args?: Subset<T, cpfsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], CpfsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Cpfs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {CpfsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends CpfsAggregateArgs>(args: Subset<T, CpfsAggregateArgs>): Prisma.PrismaPromise<GetCpfsAggregateType<T>>

    /**
     * Group by Cpfs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {cpfsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends cpfsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: cpfsGroupByArgs['orderBy'] }
        : { orderBy?: cpfsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, cpfsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetCpfsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the cpfs model
   */
  readonly fields: cpfsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for cpfs.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__cpfsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the cpfs model
   */
  interface cpfsFieldRefs {
    readonly id: FieldRef<"cpfs", 'String'>
    readonly cpf: FieldRef<"cpfs", 'String'>
    readonly nome: FieldRef<"cpfs", 'String'>
    readonly createdAt: FieldRef<"cpfs", 'DateTime'>
    readonly updatedAt: FieldRef<"cpfs", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * cpfs findUnique
   */
  export type cpfsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cpfs
     */
    select?: cpfsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the cpfs
     */
    omit?: cpfsOmit<ExtArgs> | null
    /**
     * Filter, which cpfs to fetch.
     */
    where: cpfsWhereUniqueInput
  }

  /**
   * cpfs findUniqueOrThrow
   */
  export type cpfsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cpfs
     */
    select?: cpfsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the cpfs
     */
    omit?: cpfsOmit<ExtArgs> | null
    /**
     * Filter, which cpfs to fetch.
     */
    where: cpfsWhereUniqueInput
  }

  /**
   * cpfs findFirst
   */
  export type cpfsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cpfs
     */
    select?: cpfsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the cpfs
     */
    omit?: cpfsOmit<ExtArgs> | null
    /**
     * Filter, which cpfs to fetch.
     */
    where?: cpfsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of cpfs to fetch.
     */
    orderBy?: cpfsOrderByWithRelationInput | cpfsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for cpfs.
     */
    cursor?: cpfsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` cpfs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` cpfs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of cpfs.
     */
    distinct?: CpfsScalarFieldEnum | CpfsScalarFieldEnum[]
  }

  /**
   * cpfs findFirstOrThrow
   */
  export type cpfsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cpfs
     */
    select?: cpfsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the cpfs
     */
    omit?: cpfsOmit<ExtArgs> | null
    /**
     * Filter, which cpfs to fetch.
     */
    where?: cpfsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of cpfs to fetch.
     */
    orderBy?: cpfsOrderByWithRelationInput | cpfsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for cpfs.
     */
    cursor?: cpfsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` cpfs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` cpfs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of cpfs.
     */
    distinct?: CpfsScalarFieldEnum | CpfsScalarFieldEnum[]
  }

  /**
   * cpfs findMany
   */
  export type cpfsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cpfs
     */
    select?: cpfsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the cpfs
     */
    omit?: cpfsOmit<ExtArgs> | null
    /**
     * Filter, which cpfs to fetch.
     */
    where?: cpfsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of cpfs to fetch.
     */
    orderBy?: cpfsOrderByWithRelationInput | cpfsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing cpfs.
     */
    cursor?: cpfsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` cpfs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` cpfs.
     */
    skip?: number
    distinct?: CpfsScalarFieldEnum | CpfsScalarFieldEnum[]
  }

  /**
   * cpfs create
   */
  export type cpfsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cpfs
     */
    select?: cpfsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the cpfs
     */
    omit?: cpfsOmit<ExtArgs> | null
    /**
     * The data needed to create a cpfs.
     */
    data: XOR<cpfsCreateInput, cpfsUncheckedCreateInput>
  }

  /**
   * cpfs createMany
   */
  export type cpfsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many cpfs.
     */
    data: cpfsCreateManyInput | cpfsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * cpfs createManyAndReturn
   */
  export type cpfsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cpfs
     */
    select?: cpfsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the cpfs
     */
    omit?: cpfsOmit<ExtArgs> | null
    /**
     * The data used to create many cpfs.
     */
    data: cpfsCreateManyInput | cpfsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * cpfs update
   */
  export type cpfsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cpfs
     */
    select?: cpfsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the cpfs
     */
    omit?: cpfsOmit<ExtArgs> | null
    /**
     * The data needed to update a cpfs.
     */
    data: XOR<cpfsUpdateInput, cpfsUncheckedUpdateInput>
    /**
     * Choose, which cpfs to update.
     */
    where: cpfsWhereUniqueInput
  }

  /**
   * cpfs updateMany
   */
  export type cpfsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update cpfs.
     */
    data: XOR<cpfsUpdateManyMutationInput, cpfsUncheckedUpdateManyInput>
    /**
     * Filter which cpfs to update
     */
    where?: cpfsWhereInput
    /**
     * Limit how many cpfs to update.
     */
    limit?: number
  }

  /**
   * cpfs updateManyAndReturn
   */
  export type cpfsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cpfs
     */
    select?: cpfsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the cpfs
     */
    omit?: cpfsOmit<ExtArgs> | null
    /**
     * The data used to update cpfs.
     */
    data: XOR<cpfsUpdateManyMutationInput, cpfsUncheckedUpdateManyInput>
    /**
     * Filter which cpfs to update
     */
    where?: cpfsWhereInput
    /**
     * Limit how many cpfs to update.
     */
    limit?: number
  }

  /**
   * cpfs upsert
   */
  export type cpfsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cpfs
     */
    select?: cpfsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the cpfs
     */
    omit?: cpfsOmit<ExtArgs> | null
    /**
     * The filter to search for the cpfs to update in case it exists.
     */
    where: cpfsWhereUniqueInput
    /**
     * In case the cpfs found by the `where` argument doesn't exist, create a new cpfs with this data.
     */
    create: XOR<cpfsCreateInput, cpfsUncheckedCreateInput>
    /**
     * In case the cpfs was found with the provided `where` argument, update it with this data.
     */
    update: XOR<cpfsUpdateInput, cpfsUncheckedUpdateInput>
  }

  /**
   * cpfs delete
   */
  export type cpfsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cpfs
     */
    select?: cpfsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the cpfs
     */
    omit?: cpfsOmit<ExtArgs> | null
    /**
     * Filter which cpfs to delete.
     */
    where: cpfsWhereUniqueInput
  }

  /**
   * cpfs deleteMany
   */
  export type cpfsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which cpfs to delete
     */
    where?: cpfsWhereInput
    /**
     * Limit how many cpfs to delete.
     */
    limit?: number
  }

  /**
   * cpfs without action
   */
  export type cpfsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the cpfs
     */
    select?: cpfsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the cpfs
     */
    omit?: cpfsOmit<ExtArgs> | null
  }


  /**
   * Model tickets_fechados
   */

  export type AggregateTickets_fechados = {
    _count: Tickets_fechadosCountAggregateOutputType | null
    _min: Tickets_fechadosMinAggregateOutputType | null
    _max: Tickets_fechadosMaxAggregateOutputType | null
  }

  export type Tickets_fechadosMinAggregateOutputType = {
    id: string | null
    ticket: string | null
    nome: string | null
    cpf: string | null
    setor: string | null
    historico: string | null
    prioridade: string | null
    anexoUrl: string | null
    atendente: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type Tickets_fechadosMaxAggregateOutputType = {
    id: string | null
    ticket: string | null
    nome: string | null
    cpf: string | null
    setor: string | null
    historico: string | null
    prioridade: string | null
    anexoUrl: string | null
    atendente: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type Tickets_fechadosCountAggregateOutputType = {
    id: number
    ticket: number
    nome: number
    cpf: number
    setor: number
    historico: number
    prioridade: number
    anexoUrl: number
    atendente: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type Tickets_fechadosMinAggregateInputType = {
    id?: true
    ticket?: true
    nome?: true
    cpf?: true
    setor?: true
    historico?: true
    prioridade?: true
    anexoUrl?: true
    atendente?: true
    createdAt?: true
    updatedAt?: true
  }

  export type Tickets_fechadosMaxAggregateInputType = {
    id?: true
    ticket?: true
    nome?: true
    cpf?: true
    setor?: true
    historico?: true
    prioridade?: true
    anexoUrl?: true
    atendente?: true
    createdAt?: true
    updatedAt?: true
  }

  export type Tickets_fechadosCountAggregateInputType = {
    id?: true
    ticket?: true
    nome?: true
    cpf?: true
    setor?: true
    historico?: true
    prioridade?: true
    anexoUrl?: true
    atendente?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type Tickets_fechadosAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tickets_fechados to aggregate.
     */
    where?: tickets_fechadosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tickets_fechados to fetch.
     */
    orderBy?: tickets_fechadosOrderByWithRelationInput | tickets_fechadosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: tickets_fechadosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tickets_fechados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tickets_fechados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned tickets_fechados
    **/
    _count?: true | Tickets_fechadosCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Tickets_fechadosMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Tickets_fechadosMaxAggregateInputType
  }

  export type GetTickets_fechadosAggregateType<T extends Tickets_fechadosAggregateArgs> = {
        [P in keyof T & keyof AggregateTickets_fechados]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTickets_fechados[P]>
      : GetScalarType<T[P], AggregateTickets_fechados[P]>
  }




  export type tickets_fechadosGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: tickets_fechadosWhereInput
    orderBy?: tickets_fechadosOrderByWithAggregationInput | tickets_fechadosOrderByWithAggregationInput[]
    by: Tickets_fechadosScalarFieldEnum[] | Tickets_fechadosScalarFieldEnum
    having?: tickets_fechadosScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Tickets_fechadosCountAggregateInputType | true
    _min?: Tickets_fechadosMinAggregateInputType
    _max?: Tickets_fechadosMaxAggregateInputType
  }

  export type Tickets_fechadosGroupByOutputType = {
    id: string
    ticket: string
    nome: string
    cpf: string
    setor: string
    historico: string | null
    prioridade: string
    anexoUrl: string | null
    atendente: string | null
    createdAt: Date
    updatedAt: Date
    _count: Tickets_fechadosCountAggregateOutputType | null
    _min: Tickets_fechadosMinAggregateOutputType | null
    _max: Tickets_fechadosMaxAggregateOutputType | null
  }

  type GetTickets_fechadosGroupByPayload<T extends tickets_fechadosGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Tickets_fechadosGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Tickets_fechadosGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Tickets_fechadosGroupByOutputType[P]>
            : GetScalarType<T[P], Tickets_fechadosGroupByOutputType[P]>
        }
      >
    >


  export type tickets_fechadosSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ticket?: boolean
    nome?: boolean
    cpf?: boolean
    setor?: boolean
    historico?: boolean
    prioridade?: boolean
    anexoUrl?: boolean
    atendente?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tickets_fechados"]>

  export type tickets_fechadosSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ticket?: boolean
    nome?: boolean
    cpf?: boolean
    setor?: boolean
    historico?: boolean
    prioridade?: boolean
    anexoUrl?: boolean
    atendente?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tickets_fechados"]>

  export type tickets_fechadosSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    ticket?: boolean
    nome?: boolean
    cpf?: boolean
    setor?: boolean
    historico?: boolean
    prioridade?: boolean
    anexoUrl?: boolean
    atendente?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["tickets_fechados"]>

  export type tickets_fechadosSelectScalar = {
    id?: boolean
    ticket?: boolean
    nome?: boolean
    cpf?: boolean
    setor?: boolean
    historico?: boolean
    prioridade?: boolean
    anexoUrl?: boolean
    atendente?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type tickets_fechadosOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "ticket" | "nome" | "cpf" | "setor" | "historico" | "prioridade" | "anexoUrl" | "atendente" | "createdAt" | "updatedAt", ExtArgs["result"]["tickets_fechados"]>

  export type $tickets_fechadosPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "tickets_fechados"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      ticket: string
      nome: string
      cpf: string
      setor: string
      historico: string | null
      prioridade: string
      anexoUrl: string | null
      atendente: string | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["tickets_fechados"]>
    composites: {}
  }

  type tickets_fechadosGetPayload<S extends boolean | null | undefined | tickets_fechadosDefaultArgs> = $Result.GetResult<Prisma.$tickets_fechadosPayload, S>

  type tickets_fechadosCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<tickets_fechadosFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Tickets_fechadosCountAggregateInputType | true
    }

  export interface tickets_fechadosDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['tickets_fechados'], meta: { name: 'tickets_fechados' } }
    /**
     * Find zero or one Tickets_fechados that matches the filter.
     * @param {tickets_fechadosFindUniqueArgs} args - Arguments to find a Tickets_fechados
     * @example
     * // Get one Tickets_fechados
     * const tickets_fechados = await prisma.tickets_fechados.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends tickets_fechadosFindUniqueArgs>(args: SelectSubset<T, tickets_fechadosFindUniqueArgs<ExtArgs>>): Prisma__tickets_fechadosClient<$Result.GetResult<Prisma.$tickets_fechadosPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tickets_fechados that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {tickets_fechadosFindUniqueOrThrowArgs} args - Arguments to find a Tickets_fechados
     * @example
     * // Get one Tickets_fechados
     * const tickets_fechados = await prisma.tickets_fechados.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends tickets_fechadosFindUniqueOrThrowArgs>(args: SelectSubset<T, tickets_fechadosFindUniqueOrThrowArgs<ExtArgs>>): Prisma__tickets_fechadosClient<$Result.GetResult<Prisma.$tickets_fechadosPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tickets_fechados that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tickets_fechadosFindFirstArgs} args - Arguments to find a Tickets_fechados
     * @example
     * // Get one Tickets_fechados
     * const tickets_fechados = await prisma.tickets_fechados.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends tickets_fechadosFindFirstArgs>(args?: SelectSubset<T, tickets_fechadosFindFirstArgs<ExtArgs>>): Prisma__tickets_fechadosClient<$Result.GetResult<Prisma.$tickets_fechadosPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tickets_fechados that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tickets_fechadosFindFirstOrThrowArgs} args - Arguments to find a Tickets_fechados
     * @example
     * // Get one Tickets_fechados
     * const tickets_fechados = await prisma.tickets_fechados.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends tickets_fechadosFindFirstOrThrowArgs>(args?: SelectSubset<T, tickets_fechadosFindFirstOrThrowArgs<ExtArgs>>): Prisma__tickets_fechadosClient<$Result.GetResult<Prisma.$tickets_fechadosPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tickets_fechados that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tickets_fechadosFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tickets_fechados
     * const tickets_fechados = await prisma.tickets_fechados.findMany()
     * 
     * // Get first 10 Tickets_fechados
     * const tickets_fechados = await prisma.tickets_fechados.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const tickets_fechadosWithIdOnly = await prisma.tickets_fechados.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends tickets_fechadosFindManyArgs>(args?: SelectSubset<T, tickets_fechadosFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tickets_fechadosPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tickets_fechados.
     * @param {tickets_fechadosCreateArgs} args - Arguments to create a Tickets_fechados.
     * @example
     * // Create one Tickets_fechados
     * const Tickets_fechados = await prisma.tickets_fechados.create({
     *   data: {
     *     // ... data to create a Tickets_fechados
     *   }
     * })
     * 
     */
    create<T extends tickets_fechadosCreateArgs>(args: SelectSubset<T, tickets_fechadosCreateArgs<ExtArgs>>): Prisma__tickets_fechadosClient<$Result.GetResult<Prisma.$tickets_fechadosPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tickets_fechados.
     * @param {tickets_fechadosCreateManyArgs} args - Arguments to create many Tickets_fechados.
     * @example
     * // Create many Tickets_fechados
     * const tickets_fechados = await prisma.tickets_fechados.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends tickets_fechadosCreateManyArgs>(args?: SelectSubset<T, tickets_fechadosCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Tickets_fechados and returns the data saved in the database.
     * @param {tickets_fechadosCreateManyAndReturnArgs} args - Arguments to create many Tickets_fechados.
     * @example
     * // Create many Tickets_fechados
     * const tickets_fechados = await prisma.tickets_fechados.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Tickets_fechados and only return the `id`
     * const tickets_fechadosWithIdOnly = await prisma.tickets_fechados.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends tickets_fechadosCreateManyAndReturnArgs>(args?: SelectSubset<T, tickets_fechadosCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tickets_fechadosPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Tickets_fechados.
     * @param {tickets_fechadosDeleteArgs} args - Arguments to delete one Tickets_fechados.
     * @example
     * // Delete one Tickets_fechados
     * const Tickets_fechados = await prisma.tickets_fechados.delete({
     *   where: {
     *     // ... filter to delete one Tickets_fechados
     *   }
     * })
     * 
     */
    delete<T extends tickets_fechadosDeleteArgs>(args: SelectSubset<T, tickets_fechadosDeleteArgs<ExtArgs>>): Prisma__tickets_fechadosClient<$Result.GetResult<Prisma.$tickets_fechadosPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tickets_fechados.
     * @param {tickets_fechadosUpdateArgs} args - Arguments to update one Tickets_fechados.
     * @example
     * // Update one Tickets_fechados
     * const tickets_fechados = await prisma.tickets_fechados.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends tickets_fechadosUpdateArgs>(args: SelectSubset<T, tickets_fechadosUpdateArgs<ExtArgs>>): Prisma__tickets_fechadosClient<$Result.GetResult<Prisma.$tickets_fechadosPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tickets_fechados.
     * @param {tickets_fechadosDeleteManyArgs} args - Arguments to filter Tickets_fechados to delete.
     * @example
     * // Delete a few Tickets_fechados
     * const { count } = await prisma.tickets_fechados.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends tickets_fechadosDeleteManyArgs>(args?: SelectSubset<T, tickets_fechadosDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tickets_fechados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tickets_fechadosUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tickets_fechados
     * const tickets_fechados = await prisma.tickets_fechados.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends tickets_fechadosUpdateManyArgs>(args: SelectSubset<T, tickets_fechadosUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tickets_fechados and returns the data updated in the database.
     * @param {tickets_fechadosUpdateManyAndReturnArgs} args - Arguments to update many Tickets_fechados.
     * @example
     * // Update many Tickets_fechados
     * const tickets_fechados = await prisma.tickets_fechados.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Tickets_fechados and only return the `id`
     * const tickets_fechadosWithIdOnly = await prisma.tickets_fechados.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends tickets_fechadosUpdateManyAndReturnArgs>(args: SelectSubset<T, tickets_fechadosUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tickets_fechadosPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Tickets_fechados.
     * @param {tickets_fechadosUpsertArgs} args - Arguments to update or create a Tickets_fechados.
     * @example
     * // Update or create a Tickets_fechados
     * const tickets_fechados = await prisma.tickets_fechados.upsert({
     *   create: {
     *     // ... data to create a Tickets_fechados
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tickets_fechados we want to update
     *   }
     * })
     */
    upsert<T extends tickets_fechadosUpsertArgs>(args: SelectSubset<T, tickets_fechadosUpsertArgs<ExtArgs>>): Prisma__tickets_fechadosClient<$Result.GetResult<Prisma.$tickets_fechadosPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tickets_fechados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tickets_fechadosCountArgs} args - Arguments to filter Tickets_fechados to count.
     * @example
     * // Count the number of Tickets_fechados
     * const count = await prisma.tickets_fechados.count({
     *   where: {
     *     // ... the filter for the Tickets_fechados we want to count
     *   }
     * })
    **/
    count<T extends tickets_fechadosCountArgs>(
      args?: Subset<T, tickets_fechadosCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Tickets_fechadosCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tickets_fechados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Tickets_fechadosAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends Tickets_fechadosAggregateArgs>(args: Subset<T, Tickets_fechadosAggregateArgs>): Prisma.PrismaPromise<GetTickets_fechadosAggregateType<T>>

    /**
     * Group by Tickets_fechados.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tickets_fechadosGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends tickets_fechadosGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: tickets_fechadosGroupByArgs['orderBy'] }
        : { orderBy?: tickets_fechadosGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, tickets_fechadosGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTickets_fechadosGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the tickets_fechados model
   */
  readonly fields: tickets_fechadosFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for tickets_fechados.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__tickets_fechadosClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the tickets_fechados model
   */
  interface tickets_fechadosFieldRefs {
    readonly id: FieldRef<"tickets_fechados", 'String'>
    readonly ticket: FieldRef<"tickets_fechados", 'String'>
    readonly nome: FieldRef<"tickets_fechados", 'String'>
    readonly cpf: FieldRef<"tickets_fechados", 'String'>
    readonly setor: FieldRef<"tickets_fechados", 'String'>
    readonly historico: FieldRef<"tickets_fechados", 'String'>
    readonly prioridade: FieldRef<"tickets_fechados", 'String'>
    readonly anexoUrl: FieldRef<"tickets_fechados", 'String'>
    readonly atendente: FieldRef<"tickets_fechados", 'String'>
    readonly createdAt: FieldRef<"tickets_fechados", 'DateTime'>
    readonly updatedAt: FieldRef<"tickets_fechados", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * tickets_fechados findUnique
   */
  export type tickets_fechadosFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tickets_fechados
     */
    select?: tickets_fechadosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tickets_fechados
     */
    omit?: tickets_fechadosOmit<ExtArgs> | null
    /**
     * Filter, which tickets_fechados to fetch.
     */
    where: tickets_fechadosWhereUniqueInput
  }

  /**
   * tickets_fechados findUniqueOrThrow
   */
  export type tickets_fechadosFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tickets_fechados
     */
    select?: tickets_fechadosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tickets_fechados
     */
    omit?: tickets_fechadosOmit<ExtArgs> | null
    /**
     * Filter, which tickets_fechados to fetch.
     */
    where: tickets_fechadosWhereUniqueInput
  }

  /**
   * tickets_fechados findFirst
   */
  export type tickets_fechadosFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tickets_fechados
     */
    select?: tickets_fechadosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tickets_fechados
     */
    omit?: tickets_fechadosOmit<ExtArgs> | null
    /**
     * Filter, which tickets_fechados to fetch.
     */
    where?: tickets_fechadosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tickets_fechados to fetch.
     */
    orderBy?: tickets_fechadosOrderByWithRelationInput | tickets_fechadosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tickets_fechados.
     */
    cursor?: tickets_fechadosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tickets_fechados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tickets_fechados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tickets_fechados.
     */
    distinct?: Tickets_fechadosScalarFieldEnum | Tickets_fechadosScalarFieldEnum[]
  }

  /**
   * tickets_fechados findFirstOrThrow
   */
  export type tickets_fechadosFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tickets_fechados
     */
    select?: tickets_fechadosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tickets_fechados
     */
    omit?: tickets_fechadosOmit<ExtArgs> | null
    /**
     * Filter, which tickets_fechados to fetch.
     */
    where?: tickets_fechadosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tickets_fechados to fetch.
     */
    orderBy?: tickets_fechadosOrderByWithRelationInput | tickets_fechadosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tickets_fechados.
     */
    cursor?: tickets_fechadosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tickets_fechados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tickets_fechados.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tickets_fechados.
     */
    distinct?: Tickets_fechadosScalarFieldEnum | Tickets_fechadosScalarFieldEnum[]
  }

  /**
   * tickets_fechados findMany
   */
  export type tickets_fechadosFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tickets_fechados
     */
    select?: tickets_fechadosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tickets_fechados
     */
    omit?: tickets_fechadosOmit<ExtArgs> | null
    /**
     * Filter, which tickets_fechados to fetch.
     */
    where?: tickets_fechadosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tickets_fechados to fetch.
     */
    orderBy?: tickets_fechadosOrderByWithRelationInput | tickets_fechadosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing tickets_fechados.
     */
    cursor?: tickets_fechadosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tickets_fechados from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tickets_fechados.
     */
    skip?: number
    distinct?: Tickets_fechadosScalarFieldEnum | Tickets_fechadosScalarFieldEnum[]
  }

  /**
   * tickets_fechados create
   */
  export type tickets_fechadosCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tickets_fechados
     */
    select?: tickets_fechadosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tickets_fechados
     */
    omit?: tickets_fechadosOmit<ExtArgs> | null
    /**
     * The data needed to create a tickets_fechados.
     */
    data: XOR<tickets_fechadosCreateInput, tickets_fechadosUncheckedCreateInput>
  }

  /**
   * tickets_fechados createMany
   */
  export type tickets_fechadosCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many tickets_fechados.
     */
    data: tickets_fechadosCreateManyInput | tickets_fechadosCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * tickets_fechados createManyAndReturn
   */
  export type tickets_fechadosCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tickets_fechados
     */
    select?: tickets_fechadosSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the tickets_fechados
     */
    omit?: tickets_fechadosOmit<ExtArgs> | null
    /**
     * The data used to create many tickets_fechados.
     */
    data: tickets_fechadosCreateManyInput | tickets_fechadosCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * tickets_fechados update
   */
  export type tickets_fechadosUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tickets_fechados
     */
    select?: tickets_fechadosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tickets_fechados
     */
    omit?: tickets_fechadosOmit<ExtArgs> | null
    /**
     * The data needed to update a tickets_fechados.
     */
    data: XOR<tickets_fechadosUpdateInput, tickets_fechadosUncheckedUpdateInput>
    /**
     * Choose, which tickets_fechados to update.
     */
    where: tickets_fechadosWhereUniqueInput
  }

  /**
   * tickets_fechados updateMany
   */
  export type tickets_fechadosUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update tickets_fechados.
     */
    data: XOR<tickets_fechadosUpdateManyMutationInput, tickets_fechadosUncheckedUpdateManyInput>
    /**
     * Filter which tickets_fechados to update
     */
    where?: tickets_fechadosWhereInput
    /**
     * Limit how many tickets_fechados to update.
     */
    limit?: number
  }

  /**
   * tickets_fechados updateManyAndReturn
   */
  export type tickets_fechadosUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tickets_fechados
     */
    select?: tickets_fechadosSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the tickets_fechados
     */
    omit?: tickets_fechadosOmit<ExtArgs> | null
    /**
     * The data used to update tickets_fechados.
     */
    data: XOR<tickets_fechadosUpdateManyMutationInput, tickets_fechadosUncheckedUpdateManyInput>
    /**
     * Filter which tickets_fechados to update
     */
    where?: tickets_fechadosWhereInput
    /**
     * Limit how many tickets_fechados to update.
     */
    limit?: number
  }

  /**
   * tickets_fechados upsert
   */
  export type tickets_fechadosUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tickets_fechados
     */
    select?: tickets_fechadosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tickets_fechados
     */
    omit?: tickets_fechadosOmit<ExtArgs> | null
    /**
     * The filter to search for the tickets_fechados to update in case it exists.
     */
    where: tickets_fechadosWhereUniqueInput
    /**
     * In case the tickets_fechados found by the `where` argument doesn't exist, create a new tickets_fechados with this data.
     */
    create: XOR<tickets_fechadosCreateInput, tickets_fechadosUncheckedCreateInput>
    /**
     * In case the tickets_fechados was found with the provided `where` argument, update it with this data.
     */
    update: XOR<tickets_fechadosUpdateInput, tickets_fechadosUncheckedUpdateInput>
  }

  /**
   * tickets_fechados delete
   */
  export type tickets_fechadosDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tickets_fechados
     */
    select?: tickets_fechadosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tickets_fechados
     */
    omit?: tickets_fechadosOmit<ExtArgs> | null
    /**
     * Filter which tickets_fechados to delete.
     */
    where: tickets_fechadosWhereUniqueInput
  }

  /**
   * tickets_fechados deleteMany
   */
  export type tickets_fechadosDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tickets_fechados to delete
     */
    where?: tickets_fechadosWhereInput
    /**
     * Limit how many tickets_fechados to delete.
     */
    limit?: number
  }

  /**
   * tickets_fechados without action
   */
  export type tickets_fechadosDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tickets_fechados
     */
    select?: tickets_fechadosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tickets_fechados
     */
    omit?: tickets_fechadosOmit<ExtArgs> | null
  }


  /**
   * Model avisos
   */

  export type AggregateAvisos = {
    _count: AvisosCountAggregateOutputType | null
    _min: AvisosMinAggregateOutputType | null
    _max: AvisosMaxAggregateOutputType | null
  }

  export type AvisosMinAggregateOutputType = {
    id: string | null
    titulo: string | null
    conteudo: string | null
    setor: string | null
    duracao: string | null
    expiresAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AvisosMaxAggregateOutputType = {
    id: string | null
    titulo: string | null
    conteudo: string | null
    setor: string | null
    duracao: string | null
    expiresAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AvisosCountAggregateOutputType = {
    id: number
    titulo: number
    conteudo: number
    setor: number
    duracao: number
    expiresAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AvisosMinAggregateInputType = {
    id?: true
    titulo?: true
    conteudo?: true
    setor?: true
    duracao?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AvisosMaxAggregateInputType = {
    id?: true
    titulo?: true
    conteudo?: true
    setor?: true
    duracao?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AvisosCountAggregateInputType = {
    id?: true
    titulo?: true
    conteudo?: true
    setor?: true
    duracao?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AvisosAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which avisos to aggregate.
     */
    where?: avisosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of avisos to fetch.
     */
    orderBy?: avisosOrderByWithRelationInput | avisosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: avisosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` avisos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` avisos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned avisos
    **/
    _count?: true | AvisosCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AvisosMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AvisosMaxAggregateInputType
  }

  export type GetAvisosAggregateType<T extends AvisosAggregateArgs> = {
        [P in keyof T & keyof AggregateAvisos]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAvisos[P]>
      : GetScalarType<T[P], AggregateAvisos[P]>
  }




  export type avisosGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: avisosWhereInput
    orderBy?: avisosOrderByWithAggregationInput | avisosOrderByWithAggregationInput[]
    by: AvisosScalarFieldEnum[] | AvisosScalarFieldEnum
    having?: avisosScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AvisosCountAggregateInputType | true
    _min?: AvisosMinAggregateInputType
    _max?: AvisosMaxAggregateInputType
  }

  export type AvisosGroupByOutputType = {
    id: string
    titulo: string
    conteudo: string
    setor: string | null
    duracao: string | null
    expiresAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: AvisosCountAggregateOutputType | null
    _min: AvisosMinAggregateOutputType | null
    _max: AvisosMaxAggregateOutputType | null
  }

  type GetAvisosGroupByPayload<T extends avisosGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AvisosGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AvisosGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AvisosGroupByOutputType[P]>
            : GetScalarType<T[P], AvisosGroupByOutputType[P]>
        }
      >
    >


  export type avisosSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    titulo?: boolean
    conteudo?: boolean
    setor?: boolean
    duracao?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["avisos"]>

  export type avisosSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    titulo?: boolean
    conteudo?: boolean
    setor?: boolean
    duracao?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["avisos"]>

  export type avisosSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    titulo?: boolean
    conteudo?: boolean
    setor?: boolean
    duracao?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["avisos"]>

  export type avisosSelectScalar = {
    id?: boolean
    titulo?: boolean
    conteudo?: boolean
    setor?: boolean
    duracao?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type avisosOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "titulo" | "conteudo" | "setor" | "duracao" | "expiresAt" | "createdAt" | "updatedAt", ExtArgs["result"]["avisos"]>

  export type $avisosPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "avisos"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      titulo: string
      conteudo: string
      setor: string | null
      duracao: string | null
      expiresAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["avisos"]>
    composites: {}
  }

  type avisosGetPayload<S extends boolean | null | undefined | avisosDefaultArgs> = $Result.GetResult<Prisma.$avisosPayload, S>

  type avisosCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<avisosFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: AvisosCountAggregateInputType | true
    }

  export interface avisosDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['avisos'], meta: { name: 'avisos' } }
    /**
     * Find zero or one Avisos that matches the filter.
     * @param {avisosFindUniqueArgs} args - Arguments to find a Avisos
     * @example
     * // Get one Avisos
     * const avisos = await prisma.avisos.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends avisosFindUniqueArgs>(args: SelectSubset<T, avisosFindUniqueArgs<ExtArgs>>): Prisma__avisosClient<$Result.GetResult<Prisma.$avisosPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Avisos that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {avisosFindUniqueOrThrowArgs} args - Arguments to find a Avisos
     * @example
     * // Get one Avisos
     * const avisos = await prisma.avisos.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends avisosFindUniqueOrThrowArgs>(args: SelectSubset<T, avisosFindUniqueOrThrowArgs<ExtArgs>>): Prisma__avisosClient<$Result.GetResult<Prisma.$avisosPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Avisos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {avisosFindFirstArgs} args - Arguments to find a Avisos
     * @example
     * // Get one Avisos
     * const avisos = await prisma.avisos.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends avisosFindFirstArgs>(args?: SelectSubset<T, avisosFindFirstArgs<ExtArgs>>): Prisma__avisosClient<$Result.GetResult<Prisma.$avisosPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Avisos that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {avisosFindFirstOrThrowArgs} args - Arguments to find a Avisos
     * @example
     * // Get one Avisos
     * const avisos = await prisma.avisos.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends avisosFindFirstOrThrowArgs>(args?: SelectSubset<T, avisosFindFirstOrThrowArgs<ExtArgs>>): Prisma__avisosClient<$Result.GetResult<Prisma.$avisosPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Avisos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {avisosFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Avisos
     * const avisos = await prisma.avisos.findMany()
     * 
     * // Get first 10 Avisos
     * const avisos = await prisma.avisos.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const avisosWithIdOnly = await prisma.avisos.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends avisosFindManyArgs>(args?: SelectSubset<T, avisosFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$avisosPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Avisos.
     * @param {avisosCreateArgs} args - Arguments to create a Avisos.
     * @example
     * // Create one Avisos
     * const Avisos = await prisma.avisos.create({
     *   data: {
     *     // ... data to create a Avisos
     *   }
     * })
     * 
     */
    create<T extends avisosCreateArgs>(args: SelectSubset<T, avisosCreateArgs<ExtArgs>>): Prisma__avisosClient<$Result.GetResult<Prisma.$avisosPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Avisos.
     * @param {avisosCreateManyArgs} args - Arguments to create many Avisos.
     * @example
     * // Create many Avisos
     * const avisos = await prisma.avisos.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends avisosCreateManyArgs>(args?: SelectSubset<T, avisosCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Avisos and returns the data saved in the database.
     * @param {avisosCreateManyAndReturnArgs} args - Arguments to create many Avisos.
     * @example
     * // Create many Avisos
     * const avisos = await prisma.avisos.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Avisos and only return the `id`
     * const avisosWithIdOnly = await prisma.avisos.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends avisosCreateManyAndReturnArgs>(args?: SelectSubset<T, avisosCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$avisosPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Avisos.
     * @param {avisosDeleteArgs} args - Arguments to delete one Avisos.
     * @example
     * // Delete one Avisos
     * const Avisos = await prisma.avisos.delete({
     *   where: {
     *     // ... filter to delete one Avisos
     *   }
     * })
     * 
     */
    delete<T extends avisosDeleteArgs>(args: SelectSubset<T, avisosDeleteArgs<ExtArgs>>): Prisma__avisosClient<$Result.GetResult<Prisma.$avisosPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Avisos.
     * @param {avisosUpdateArgs} args - Arguments to update one Avisos.
     * @example
     * // Update one Avisos
     * const avisos = await prisma.avisos.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends avisosUpdateArgs>(args: SelectSubset<T, avisosUpdateArgs<ExtArgs>>): Prisma__avisosClient<$Result.GetResult<Prisma.$avisosPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Avisos.
     * @param {avisosDeleteManyArgs} args - Arguments to filter Avisos to delete.
     * @example
     * // Delete a few Avisos
     * const { count } = await prisma.avisos.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends avisosDeleteManyArgs>(args?: SelectSubset<T, avisosDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Avisos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {avisosUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Avisos
     * const avisos = await prisma.avisos.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends avisosUpdateManyArgs>(args: SelectSubset<T, avisosUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Avisos and returns the data updated in the database.
     * @param {avisosUpdateManyAndReturnArgs} args - Arguments to update many Avisos.
     * @example
     * // Update many Avisos
     * const avisos = await prisma.avisos.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Avisos and only return the `id`
     * const avisosWithIdOnly = await prisma.avisos.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends avisosUpdateManyAndReturnArgs>(args: SelectSubset<T, avisosUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$avisosPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Avisos.
     * @param {avisosUpsertArgs} args - Arguments to update or create a Avisos.
     * @example
     * // Update or create a Avisos
     * const avisos = await prisma.avisos.upsert({
     *   create: {
     *     // ... data to create a Avisos
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Avisos we want to update
     *   }
     * })
     */
    upsert<T extends avisosUpsertArgs>(args: SelectSubset<T, avisosUpsertArgs<ExtArgs>>): Prisma__avisosClient<$Result.GetResult<Prisma.$avisosPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Avisos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {avisosCountArgs} args - Arguments to filter Avisos to count.
     * @example
     * // Count the number of Avisos
     * const count = await prisma.avisos.count({
     *   where: {
     *     // ... the filter for the Avisos we want to count
     *   }
     * })
    **/
    count<T extends avisosCountArgs>(
      args?: Subset<T, avisosCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AvisosCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Avisos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AvisosAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AvisosAggregateArgs>(args: Subset<T, AvisosAggregateArgs>): Prisma.PrismaPromise<GetAvisosAggregateType<T>>

    /**
     * Group by Avisos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {avisosGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends avisosGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: avisosGroupByArgs['orderBy'] }
        : { orderBy?: avisosGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, avisosGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAvisosGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the avisos model
   */
  readonly fields: avisosFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for avisos.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__avisosClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the avisos model
   */
  interface avisosFieldRefs {
    readonly id: FieldRef<"avisos", 'String'>
    readonly titulo: FieldRef<"avisos", 'String'>
    readonly conteudo: FieldRef<"avisos", 'String'>
    readonly setor: FieldRef<"avisos", 'String'>
    readonly duracao: FieldRef<"avisos", 'String'>
    readonly expiresAt: FieldRef<"avisos", 'DateTime'>
    readonly createdAt: FieldRef<"avisos", 'DateTime'>
    readonly updatedAt: FieldRef<"avisos", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * avisos findUnique
   */
  export type avisosFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the avisos
     */
    select?: avisosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the avisos
     */
    omit?: avisosOmit<ExtArgs> | null
    /**
     * Filter, which avisos to fetch.
     */
    where: avisosWhereUniqueInput
  }

  /**
   * avisos findUniqueOrThrow
   */
  export type avisosFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the avisos
     */
    select?: avisosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the avisos
     */
    omit?: avisosOmit<ExtArgs> | null
    /**
     * Filter, which avisos to fetch.
     */
    where: avisosWhereUniqueInput
  }

  /**
   * avisos findFirst
   */
  export type avisosFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the avisos
     */
    select?: avisosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the avisos
     */
    omit?: avisosOmit<ExtArgs> | null
    /**
     * Filter, which avisos to fetch.
     */
    where?: avisosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of avisos to fetch.
     */
    orderBy?: avisosOrderByWithRelationInput | avisosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for avisos.
     */
    cursor?: avisosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` avisos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` avisos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of avisos.
     */
    distinct?: AvisosScalarFieldEnum | AvisosScalarFieldEnum[]
  }

  /**
   * avisos findFirstOrThrow
   */
  export type avisosFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the avisos
     */
    select?: avisosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the avisos
     */
    omit?: avisosOmit<ExtArgs> | null
    /**
     * Filter, which avisos to fetch.
     */
    where?: avisosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of avisos to fetch.
     */
    orderBy?: avisosOrderByWithRelationInput | avisosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for avisos.
     */
    cursor?: avisosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` avisos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` avisos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of avisos.
     */
    distinct?: AvisosScalarFieldEnum | AvisosScalarFieldEnum[]
  }

  /**
   * avisos findMany
   */
  export type avisosFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the avisos
     */
    select?: avisosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the avisos
     */
    omit?: avisosOmit<ExtArgs> | null
    /**
     * Filter, which avisos to fetch.
     */
    where?: avisosWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of avisos to fetch.
     */
    orderBy?: avisosOrderByWithRelationInput | avisosOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing avisos.
     */
    cursor?: avisosWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` avisos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` avisos.
     */
    skip?: number
    distinct?: AvisosScalarFieldEnum | AvisosScalarFieldEnum[]
  }

  /**
   * avisos create
   */
  export type avisosCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the avisos
     */
    select?: avisosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the avisos
     */
    omit?: avisosOmit<ExtArgs> | null
    /**
     * The data needed to create a avisos.
     */
    data: XOR<avisosCreateInput, avisosUncheckedCreateInput>
  }

  /**
   * avisos createMany
   */
  export type avisosCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many avisos.
     */
    data: avisosCreateManyInput | avisosCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * avisos createManyAndReturn
   */
  export type avisosCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the avisos
     */
    select?: avisosSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the avisos
     */
    omit?: avisosOmit<ExtArgs> | null
    /**
     * The data used to create many avisos.
     */
    data: avisosCreateManyInput | avisosCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * avisos update
   */
  export type avisosUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the avisos
     */
    select?: avisosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the avisos
     */
    omit?: avisosOmit<ExtArgs> | null
    /**
     * The data needed to update a avisos.
     */
    data: XOR<avisosUpdateInput, avisosUncheckedUpdateInput>
    /**
     * Choose, which avisos to update.
     */
    where: avisosWhereUniqueInput
  }

  /**
   * avisos updateMany
   */
  export type avisosUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update avisos.
     */
    data: XOR<avisosUpdateManyMutationInput, avisosUncheckedUpdateManyInput>
    /**
     * Filter which avisos to update
     */
    where?: avisosWhereInput
    /**
     * Limit how many avisos to update.
     */
    limit?: number
  }

  /**
   * avisos updateManyAndReturn
   */
  export type avisosUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the avisos
     */
    select?: avisosSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the avisos
     */
    omit?: avisosOmit<ExtArgs> | null
    /**
     * The data used to update avisos.
     */
    data: XOR<avisosUpdateManyMutationInput, avisosUncheckedUpdateManyInput>
    /**
     * Filter which avisos to update
     */
    where?: avisosWhereInput
    /**
     * Limit how many avisos to update.
     */
    limit?: number
  }

  /**
   * avisos upsert
   */
  export type avisosUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the avisos
     */
    select?: avisosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the avisos
     */
    omit?: avisosOmit<ExtArgs> | null
    /**
     * The filter to search for the avisos to update in case it exists.
     */
    where: avisosWhereUniqueInput
    /**
     * In case the avisos found by the `where` argument doesn't exist, create a new avisos with this data.
     */
    create: XOR<avisosCreateInput, avisosUncheckedCreateInput>
    /**
     * In case the avisos was found with the provided `where` argument, update it with this data.
     */
    update: XOR<avisosUpdateInput, avisosUncheckedUpdateInput>
  }

  /**
   * avisos delete
   */
  export type avisosDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the avisos
     */
    select?: avisosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the avisos
     */
    omit?: avisosOmit<ExtArgs> | null
    /**
     * Filter which avisos to delete.
     */
    where: avisosWhereUniqueInput
  }

  /**
   * avisos deleteMany
   */
  export type avisosDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which avisos to delete
     */
    where?: avisosWhereInput
    /**
     * Limit how many avisos to delete.
     */
    limit?: number
  }

  /**
   * avisos without action
   */
  export type avisosDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the avisos
     */
    select?: avisosSelect<ExtArgs> | null
    /**
     * Omit specific fields from the avisos
     */
    omit?: avisosOmit<ExtArgs> | null
  }


  /**
   * Model resumoPersona
   */

  export type AggregateResumoPersona = {
    _count: ResumoPersonaCountAggregateOutputType | null
    _min: ResumoPersonaMinAggregateOutputType | null
    _max: ResumoPersonaMaxAggregateOutputType | null
  }

  export type ResumoPersonaMinAggregateOutputType = {
    id: string | null
    cpf: string | null
    nome: string | null
    resumo: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ResumoPersonaMaxAggregateOutputType = {
    id: string | null
    cpf: string | null
    nome: string | null
    resumo: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ResumoPersonaCountAggregateOutputType = {
    id: number
    cpf: number
    nome: number
    resumo: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ResumoPersonaMinAggregateInputType = {
    id?: true
    cpf?: true
    nome?: true
    resumo?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ResumoPersonaMaxAggregateInputType = {
    id?: true
    cpf?: true
    nome?: true
    resumo?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ResumoPersonaCountAggregateInputType = {
    id?: true
    cpf?: true
    nome?: true
    resumo?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ResumoPersonaAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which resumoPersona to aggregate.
     */
    where?: resumoPersonaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of resumoPersonas to fetch.
     */
    orderBy?: resumoPersonaOrderByWithRelationInput | resumoPersonaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: resumoPersonaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` resumoPersonas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` resumoPersonas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned resumoPersonas
    **/
    _count?: true | ResumoPersonaCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ResumoPersonaMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ResumoPersonaMaxAggregateInputType
  }

  export type GetResumoPersonaAggregateType<T extends ResumoPersonaAggregateArgs> = {
        [P in keyof T & keyof AggregateResumoPersona]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateResumoPersona[P]>
      : GetScalarType<T[P], AggregateResumoPersona[P]>
  }




  export type resumoPersonaGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: resumoPersonaWhereInput
    orderBy?: resumoPersonaOrderByWithAggregationInput | resumoPersonaOrderByWithAggregationInput[]
    by: ResumoPersonaScalarFieldEnum[] | ResumoPersonaScalarFieldEnum
    having?: resumoPersonaScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ResumoPersonaCountAggregateInputType | true
    _min?: ResumoPersonaMinAggregateInputType
    _max?: ResumoPersonaMaxAggregateInputType
  }

  export type ResumoPersonaGroupByOutputType = {
    id: string
    cpf: string
    nome: string
    resumo: string
    createdAt: Date
    updatedAt: Date
    _count: ResumoPersonaCountAggregateOutputType | null
    _min: ResumoPersonaMinAggregateOutputType | null
    _max: ResumoPersonaMaxAggregateOutputType | null
  }

  type GetResumoPersonaGroupByPayload<T extends resumoPersonaGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ResumoPersonaGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ResumoPersonaGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ResumoPersonaGroupByOutputType[P]>
            : GetScalarType<T[P], ResumoPersonaGroupByOutputType[P]>
        }
      >
    >


  export type resumoPersonaSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    cpf?: boolean
    nome?: boolean
    resumo?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["resumoPersona"]>

  export type resumoPersonaSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    cpf?: boolean
    nome?: boolean
    resumo?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["resumoPersona"]>

  export type resumoPersonaSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    cpf?: boolean
    nome?: boolean
    resumo?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["resumoPersona"]>

  export type resumoPersonaSelectScalar = {
    id?: boolean
    cpf?: boolean
    nome?: boolean
    resumo?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type resumoPersonaOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "cpf" | "nome" | "resumo" | "createdAt" | "updatedAt", ExtArgs["result"]["resumoPersona"]>

  export type $resumoPersonaPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "resumoPersona"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      cpf: string
      nome: string
      resumo: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["resumoPersona"]>
    composites: {}
  }

  type resumoPersonaGetPayload<S extends boolean | null | undefined | resumoPersonaDefaultArgs> = $Result.GetResult<Prisma.$resumoPersonaPayload, S>

  type resumoPersonaCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<resumoPersonaFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ResumoPersonaCountAggregateInputType | true
    }

  export interface resumoPersonaDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['resumoPersona'], meta: { name: 'resumoPersona' } }
    /**
     * Find zero or one ResumoPersona that matches the filter.
     * @param {resumoPersonaFindUniqueArgs} args - Arguments to find a ResumoPersona
     * @example
     * // Get one ResumoPersona
     * const resumoPersona = await prisma.resumoPersona.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends resumoPersonaFindUniqueArgs>(args: SelectSubset<T, resumoPersonaFindUniqueArgs<ExtArgs>>): Prisma__resumoPersonaClient<$Result.GetResult<Prisma.$resumoPersonaPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ResumoPersona that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {resumoPersonaFindUniqueOrThrowArgs} args - Arguments to find a ResumoPersona
     * @example
     * // Get one ResumoPersona
     * const resumoPersona = await prisma.resumoPersona.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends resumoPersonaFindUniqueOrThrowArgs>(args: SelectSubset<T, resumoPersonaFindUniqueOrThrowArgs<ExtArgs>>): Prisma__resumoPersonaClient<$Result.GetResult<Prisma.$resumoPersonaPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ResumoPersona that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {resumoPersonaFindFirstArgs} args - Arguments to find a ResumoPersona
     * @example
     * // Get one ResumoPersona
     * const resumoPersona = await prisma.resumoPersona.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends resumoPersonaFindFirstArgs>(args?: SelectSubset<T, resumoPersonaFindFirstArgs<ExtArgs>>): Prisma__resumoPersonaClient<$Result.GetResult<Prisma.$resumoPersonaPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ResumoPersona that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {resumoPersonaFindFirstOrThrowArgs} args - Arguments to find a ResumoPersona
     * @example
     * // Get one ResumoPersona
     * const resumoPersona = await prisma.resumoPersona.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends resumoPersonaFindFirstOrThrowArgs>(args?: SelectSubset<T, resumoPersonaFindFirstOrThrowArgs<ExtArgs>>): Prisma__resumoPersonaClient<$Result.GetResult<Prisma.$resumoPersonaPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ResumoPersonas that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {resumoPersonaFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ResumoPersonas
     * const resumoPersonas = await prisma.resumoPersona.findMany()
     * 
     * // Get first 10 ResumoPersonas
     * const resumoPersonas = await prisma.resumoPersona.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const resumoPersonaWithIdOnly = await prisma.resumoPersona.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends resumoPersonaFindManyArgs>(args?: SelectSubset<T, resumoPersonaFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$resumoPersonaPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ResumoPersona.
     * @param {resumoPersonaCreateArgs} args - Arguments to create a ResumoPersona.
     * @example
     * // Create one ResumoPersona
     * const ResumoPersona = await prisma.resumoPersona.create({
     *   data: {
     *     // ... data to create a ResumoPersona
     *   }
     * })
     * 
     */
    create<T extends resumoPersonaCreateArgs>(args: SelectSubset<T, resumoPersonaCreateArgs<ExtArgs>>): Prisma__resumoPersonaClient<$Result.GetResult<Prisma.$resumoPersonaPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ResumoPersonas.
     * @param {resumoPersonaCreateManyArgs} args - Arguments to create many ResumoPersonas.
     * @example
     * // Create many ResumoPersonas
     * const resumoPersona = await prisma.resumoPersona.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends resumoPersonaCreateManyArgs>(args?: SelectSubset<T, resumoPersonaCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ResumoPersonas and returns the data saved in the database.
     * @param {resumoPersonaCreateManyAndReturnArgs} args - Arguments to create many ResumoPersonas.
     * @example
     * // Create many ResumoPersonas
     * const resumoPersona = await prisma.resumoPersona.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ResumoPersonas and only return the `id`
     * const resumoPersonaWithIdOnly = await prisma.resumoPersona.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends resumoPersonaCreateManyAndReturnArgs>(args?: SelectSubset<T, resumoPersonaCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$resumoPersonaPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ResumoPersona.
     * @param {resumoPersonaDeleteArgs} args - Arguments to delete one ResumoPersona.
     * @example
     * // Delete one ResumoPersona
     * const ResumoPersona = await prisma.resumoPersona.delete({
     *   where: {
     *     // ... filter to delete one ResumoPersona
     *   }
     * })
     * 
     */
    delete<T extends resumoPersonaDeleteArgs>(args: SelectSubset<T, resumoPersonaDeleteArgs<ExtArgs>>): Prisma__resumoPersonaClient<$Result.GetResult<Prisma.$resumoPersonaPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ResumoPersona.
     * @param {resumoPersonaUpdateArgs} args - Arguments to update one ResumoPersona.
     * @example
     * // Update one ResumoPersona
     * const resumoPersona = await prisma.resumoPersona.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends resumoPersonaUpdateArgs>(args: SelectSubset<T, resumoPersonaUpdateArgs<ExtArgs>>): Prisma__resumoPersonaClient<$Result.GetResult<Prisma.$resumoPersonaPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ResumoPersonas.
     * @param {resumoPersonaDeleteManyArgs} args - Arguments to filter ResumoPersonas to delete.
     * @example
     * // Delete a few ResumoPersonas
     * const { count } = await prisma.resumoPersona.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends resumoPersonaDeleteManyArgs>(args?: SelectSubset<T, resumoPersonaDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ResumoPersonas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {resumoPersonaUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ResumoPersonas
     * const resumoPersona = await prisma.resumoPersona.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends resumoPersonaUpdateManyArgs>(args: SelectSubset<T, resumoPersonaUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ResumoPersonas and returns the data updated in the database.
     * @param {resumoPersonaUpdateManyAndReturnArgs} args - Arguments to update many ResumoPersonas.
     * @example
     * // Update many ResumoPersonas
     * const resumoPersona = await prisma.resumoPersona.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ResumoPersonas and only return the `id`
     * const resumoPersonaWithIdOnly = await prisma.resumoPersona.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends resumoPersonaUpdateManyAndReturnArgs>(args: SelectSubset<T, resumoPersonaUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$resumoPersonaPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ResumoPersona.
     * @param {resumoPersonaUpsertArgs} args - Arguments to update or create a ResumoPersona.
     * @example
     * // Update or create a ResumoPersona
     * const resumoPersona = await prisma.resumoPersona.upsert({
     *   create: {
     *     // ... data to create a ResumoPersona
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ResumoPersona we want to update
     *   }
     * })
     */
    upsert<T extends resumoPersonaUpsertArgs>(args: SelectSubset<T, resumoPersonaUpsertArgs<ExtArgs>>): Prisma__resumoPersonaClient<$Result.GetResult<Prisma.$resumoPersonaPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ResumoPersonas.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {resumoPersonaCountArgs} args - Arguments to filter ResumoPersonas to count.
     * @example
     * // Count the number of ResumoPersonas
     * const count = await prisma.resumoPersona.count({
     *   where: {
     *     // ... the filter for the ResumoPersonas we want to count
     *   }
     * })
    **/
    count<T extends resumoPersonaCountArgs>(
      args?: Subset<T, resumoPersonaCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ResumoPersonaCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ResumoPersona.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ResumoPersonaAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ResumoPersonaAggregateArgs>(args: Subset<T, ResumoPersonaAggregateArgs>): Prisma.PrismaPromise<GetResumoPersonaAggregateType<T>>

    /**
     * Group by ResumoPersona.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {resumoPersonaGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends resumoPersonaGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: resumoPersonaGroupByArgs['orderBy'] }
        : { orderBy?: resumoPersonaGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, resumoPersonaGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetResumoPersonaGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the resumoPersona model
   */
  readonly fields: resumoPersonaFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for resumoPersona.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__resumoPersonaClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the resumoPersona model
   */
  interface resumoPersonaFieldRefs {
    readonly id: FieldRef<"resumoPersona", 'String'>
    readonly cpf: FieldRef<"resumoPersona", 'String'>
    readonly nome: FieldRef<"resumoPersona", 'String'>
    readonly resumo: FieldRef<"resumoPersona", 'String'>
    readonly createdAt: FieldRef<"resumoPersona", 'DateTime'>
    readonly updatedAt: FieldRef<"resumoPersona", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * resumoPersona findUnique
   */
  export type resumoPersonaFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the resumoPersona
     */
    select?: resumoPersonaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the resumoPersona
     */
    omit?: resumoPersonaOmit<ExtArgs> | null
    /**
     * Filter, which resumoPersona to fetch.
     */
    where: resumoPersonaWhereUniqueInput
  }

  /**
   * resumoPersona findUniqueOrThrow
   */
  export type resumoPersonaFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the resumoPersona
     */
    select?: resumoPersonaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the resumoPersona
     */
    omit?: resumoPersonaOmit<ExtArgs> | null
    /**
     * Filter, which resumoPersona to fetch.
     */
    where: resumoPersonaWhereUniqueInput
  }

  /**
   * resumoPersona findFirst
   */
  export type resumoPersonaFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the resumoPersona
     */
    select?: resumoPersonaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the resumoPersona
     */
    omit?: resumoPersonaOmit<ExtArgs> | null
    /**
     * Filter, which resumoPersona to fetch.
     */
    where?: resumoPersonaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of resumoPersonas to fetch.
     */
    orderBy?: resumoPersonaOrderByWithRelationInput | resumoPersonaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for resumoPersonas.
     */
    cursor?: resumoPersonaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` resumoPersonas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` resumoPersonas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of resumoPersonas.
     */
    distinct?: ResumoPersonaScalarFieldEnum | ResumoPersonaScalarFieldEnum[]
  }

  /**
   * resumoPersona findFirstOrThrow
   */
  export type resumoPersonaFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the resumoPersona
     */
    select?: resumoPersonaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the resumoPersona
     */
    omit?: resumoPersonaOmit<ExtArgs> | null
    /**
     * Filter, which resumoPersona to fetch.
     */
    where?: resumoPersonaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of resumoPersonas to fetch.
     */
    orderBy?: resumoPersonaOrderByWithRelationInput | resumoPersonaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for resumoPersonas.
     */
    cursor?: resumoPersonaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` resumoPersonas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` resumoPersonas.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of resumoPersonas.
     */
    distinct?: ResumoPersonaScalarFieldEnum | ResumoPersonaScalarFieldEnum[]
  }

  /**
   * resumoPersona findMany
   */
  export type resumoPersonaFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the resumoPersona
     */
    select?: resumoPersonaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the resumoPersona
     */
    omit?: resumoPersonaOmit<ExtArgs> | null
    /**
     * Filter, which resumoPersonas to fetch.
     */
    where?: resumoPersonaWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of resumoPersonas to fetch.
     */
    orderBy?: resumoPersonaOrderByWithRelationInput | resumoPersonaOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing resumoPersonas.
     */
    cursor?: resumoPersonaWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` resumoPersonas from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` resumoPersonas.
     */
    skip?: number
    distinct?: ResumoPersonaScalarFieldEnum | ResumoPersonaScalarFieldEnum[]
  }

  /**
   * resumoPersona create
   */
  export type resumoPersonaCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the resumoPersona
     */
    select?: resumoPersonaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the resumoPersona
     */
    omit?: resumoPersonaOmit<ExtArgs> | null
    /**
     * The data needed to create a resumoPersona.
     */
    data: XOR<resumoPersonaCreateInput, resumoPersonaUncheckedCreateInput>
  }

  /**
   * resumoPersona createMany
   */
  export type resumoPersonaCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many resumoPersonas.
     */
    data: resumoPersonaCreateManyInput | resumoPersonaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * resumoPersona createManyAndReturn
   */
  export type resumoPersonaCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the resumoPersona
     */
    select?: resumoPersonaSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the resumoPersona
     */
    omit?: resumoPersonaOmit<ExtArgs> | null
    /**
     * The data used to create many resumoPersonas.
     */
    data: resumoPersonaCreateManyInput | resumoPersonaCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * resumoPersona update
   */
  export type resumoPersonaUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the resumoPersona
     */
    select?: resumoPersonaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the resumoPersona
     */
    omit?: resumoPersonaOmit<ExtArgs> | null
    /**
     * The data needed to update a resumoPersona.
     */
    data: XOR<resumoPersonaUpdateInput, resumoPersonaUncheckedUpdateInput>
    /**
     * Choose, which resumoPersona to update.
     */
    where: resumoPersonaWhereUniqueInput
  }

  /**
   * resumoPersona updateMany
   */
  export type resumoPersonaUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update resumoPersonas.
     */
    data: XOR<resumoPersonaUpdateManyMutationInput, resumoPersonaUncheckedUpdateManyInput>
    /**
     * Filter which resumoPersonas to update
     */
    where?: resumoPersonaWhereInput
    /**
     * Limit how many resumoPersonas to update.
     */
    limit?: number
  }

  /**
   * resumoPersona updateManyAndReturn
   */
  export type resumoPersonaUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the resumoPersona
     */
    select?: resumoPersonaSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the resumoPersona
     */
    omit?: resumoPersonaOmit<ExtArgs> | null
    /**
     * The data used to update resumoPersonas.
     */
    data: XOR<resumoPersonaUpdateManyMutationInput, resumoPersonaUncheckedUpdateManyInput>
    /**
     * Filter which resumoPersonas to update
     */
    where?: resumoPersonaWhereInput
    /**
     * Limit how many resumoPersonas to update.
     */
    limit?: number
  }

  /**
   * resumoPersona upsert
   */
  export type resumoPersonaUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the resumoPersona
     */
    select?: resumoPersonaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the resumoPersona
     */
    omit?: resumoPersonaOmit<ExtArgs> | null
    /**
     * The filter to search for the resumoPersona to update in case it exists.
     */
    where: resumoPersonaWhereUniqueInput
    /**
     * In case the resumoPersona found by the `where` argument doesn't exist, create a new resumoPersona with this data.
     */
    create: XOR<resumoPersonaCreateInput, resumoPersonaUncheckedCreateInput>
    /**
     * In case the resumoPersona was found with the provided `where` argument, update it with this data.
     */
    update: XOR<resumoPersonaUpdateInput, resumoPersonaUncheckedUpdateInput>
  }

  /**
   * resumoPersona delete
   */
  export type resumoPersonaDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the resumoPersona
     */
    select?: resumoPersonaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the resumoPersona
     */
    omit?: resumoPersonaOmit<ExtArgs> | null
    /**
     * Filter which resumoPersona to delete.
     */
    where: resumoPersonaWhereUniqueInput
  }

  /**
   * resumoPersona deleteMany
   */
  export type resumoPersonaDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which resumoPersonas to delete
     */
    where?: resumoPersonaWhereInput
    /**
     * Limit how many resumoPersonas to delete.
     */
    limit?: number
  }

  /**
   * resumoPersona without action
   */
  export type resumoPersonaDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the resumoPersona
     */
    select?: resumoPersonaSelect<ExtArgs> | null
    /**
     * Omit specific fields from the resumoPersona
     */
    omit?: resumoPersonaOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    email: 'email',
    cpf: 'cpf',
    name: 'name',
    role: 'role',
    avatarUrl: 'avatarUrl',
    setor: 'setor',
    resumo: 'resumo',
    password: 'password',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const ChamadoScalarFieldEnum: {
    id: 'id',
    ticket: 'ticket',
    nome: 'nome',
    cpf: 'cpf',
    setor: 'setor',
    descricao: 'descricao',
    historico: 'historico',
    status: 'status',
    prioridade: 'prioridade',
    anexoUrl: 'anexoUrl',
    atendenteId: 'atendenteId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ChamadoScalarFieldEnum = (typeof ChamadoScalarFieldEnum)[keyof typeof ChamadoScalarFieldEnum]


  export const CpfsScalarFieldEnum: {
    id: 'id',
    cpf: 'cpf',
    nome: 'nome',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type CpfsScalarFieldEnum = (typeof CpfsScalarFieldEnum)[keyof typeof CpfsScalarFieldEnum]


  export const Tickets_fechadosScalarFieldEnum: {
    id: 'id',
    ticket: 'ticket',
    nome: 'nome',
    cpf: 'cpf',
    setor: 'setor',
    historico: 'historico',
    prioridade: 'prioridade',
    anexoUrl: 'anexoUrl',
    atendente: 'atendente',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type Tickets_fechadosScalarFieldEnum = (typeof Tickets_fechadosScalarFieldEnum)[keyof typeof Tickets_fechadosScalarFieldEnum]


  export const AvisosScalarFieldEnum: {
    id: 'id',
    titulo: 'titulo',
    conteudo: 'conteudo',
    setor: 'setor',
    duracao: 'duracao',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AvisosScalarFieldEnum = (typeof AvisosScalarFieldEnum)[keyof typeof AvisosScalarFieldEnum]


  export const ResumoPersonaScalarFieldEnum: {
    id: 'id',
    cpf: 'cpf',
    nome: 'nome',
    resumo: 'resumo',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ResumoPersonaScalarFieldEnum = (typeof ResumoPersonaScalarFieldEnum)[keyof typeof ResumoPersonaScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'ROLE'
   */
  export type EnumROLEFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ROLE'>
    


  /**
   * Reference to a field of type 'ROLE[]'
   */
  export type ListEnumROLEFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ROLE[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    
  /**
   * Deep Input Types
   */


  export type userWhereInput = {
    AND?: userWhereInput | userWhereInput[]
    OR?: userWhereInput[]
    NOT?: userWhereInput | userWhereInput[]
    id?: StringFilter<"user"> | string
    email?: StringFilter<"user"> | string
    cpf?: StringFilter<"user"> | string
    name?: StringFilter<"user"> | string
    role?: EnumROLEFilter<"user"> | $Enums.ROLE
    avatarUrl?: StringNullableFilter<"user"> | string | null
    setor?: StringFilter<"user"> | string
    resumo?: StringNullableFilter<"user"> | string | null
    password?: StringFilter<"user"> | string
    createdAt?: DateTimeFilter<"user"> | Date | string
    updatedAt?: DateTimeFilter<"user"> | Date | string
    chamados?: ChamadoListRelationFilter
  }

  export type userOrderByWithRelationInput = {
    id?: SortOrder
    email?: SortOrder
    cpf?: SortOrder
    name?: SortOrder
    role?: SortOrder
    avatarUrl?: SortOrderInput | SortOrder
    setor?: SortOrder
    resumo?: SortOrderInput | SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    chamados?: ChamadoOrderByRelationAggregateInput
  }

  export type userWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    cpf?: string
    AND?: userWhereInput | userWhereInput[]
    OR?: userWhereInput[]
    NOT?: userWhereInput | userWhereInput[]
    name?: StringFilter<"user"> | string
    role?: EnumROLEFilter<"user"> | $Enums.ROLE
    avatarUrl?: StringNullableFilter<"user"> | string | null
    setor?: StringFilter<"user"> | string
    resumo?: StringNullableFilter<"user"> | string | null
    password?: StringFilter<"user"> | string
    createdAt?: DateTimeFilter<"user"> | Date | string
    updatedAt?: DateTimeFilter<"user"> | Date | string
    chamados?: ChamadoListRelationFilter
  }, "id" | "email" | "cpf">

  export type userOrderByWithAggregationInput = {
    id?: SortOrder
    email?: SortOrder
    cpf?: SortOrder
    name?: SortOrder
    role?: SortOrder
    avatarUrl?: SortOrderInput | SortOrder
    setor?: SortOrder
    resumo?: SortOrderInput | SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: userCountOrderByAggregateInput
    _max?: userMaxOrderByAggregateInput
    _min?: userMinOrderByAggregateInput
  }

  export type userScalarWhereWithAggregatesInput = {
    AND?: userScalarWhereWithAggregatesInput | userScalarWhereWithAggregatesInput[]
    OR?: userScalarWhereWithAggregatesInput[]
    NOT?: userScalarWhereWithAggregatesInput | userScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"user"> | string
    email?: StringWithAggregatesFilter<"user"> | string
    cpf?: StringWithAggregatesFilter<"user"> | string
    name?: StringWithAggregatesFilter<"user"> | string
    role?: EnumROLEWithAggregatesFilter<"user"> | $Enums.ROLE
    avatarUrl?: StringNullableWithAggregatesFilter<"user"> | string | null
    setor?: StringWithAggregatesFilter<"user"> | string
    resumo?: StringNullableWithAggregatesFilter<"user"> | string | null
    password?: StringWithAggregatesFilter<"user"> | string
    createdAt?: DateTimeWithAggregatesFilter<"user"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"user"> | Date | string
  }

  export type ChamadoWhereInput = {
    AND?: ChamadoWhereInput | ChamadoWhereInput[]
    OR?: ChamadoWhereInput[]
    NOT?: ChamadoWhereInput | ChamadoWhereInput[]
    id?: StringFilter<"Chamado"> | string
    ticket?: StringFilter<"Chamado"> | string
    nome?: StringFilter<"Chamado"> | string
    cpf?: StringFilter<"Chamado"> | string
    setor?: StringFilter<"Chamado"> | string
    descricao?: StringFilter<"Chamado"> | string
    historico?: StringNullableFilter<"Chamado"> | string | null
    status?: StringFilter<"Chamado"> | string
    prioridade?: StringFilter<"Chamado"> | string
    anexoUrl?: StringNullableFilter<"Chamado"> | string | null
    atendenteId?: StringNullableFilter<"Chamado"> | string | null
    createdAt?: DateTimeFilter<"Chamado"> | Date | string
    updatedAt?: DateTimeFilter<"Chamado"> | Date | string
    atendente?: XOR<UserNullableScalarRelationFilter, userWhereInput> | null
  }

  export type ChamadoOrderByWithRelationInput = {
    id?: SortOrder
    ticket?: SortOrder
    nome?: SortOrder
    cpf?: SortOrder
    setor?: SortOrder
    descricao?: SortOrder
    historico?: SortOrderInput | SortOrder
    status?: SortOrder
    prioridade?: SortOrder
    anexoUrl?: SortOrderInput | SortOrder
    atendenteId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    atendente?: userOrderByWithRelationInput
  }

  export type ChamadoWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    ticket?: string
    AND?: ChamadoWhereInput | ChamadoWhereInput[]
    OR?: ChamadoWhereInput[]
    NOT?: ChamadoWhereInput | ChamadoWhereInput[]
    nome?: StringFilter<"Chamado"> | string
    cpf?: StringFilter<"Chamado"> | string
    setor?: StringFilter<"Chamado"> | string
    descricao?: StringFilter<"Chamado"> | string
    historico?: StringNullableFilter<"Chamado"> | string | null
    status?: StringFilter<"Chamado"> | string
    prioridade?: StringFilter<"Chamado"> | string
    anexoUrl?: StringNullableFilter<"Chamado"> | string | null
    atendenteId?: StringNullableFilter<"Chamado"> | string | null
    createdAt?: DateTimeFilter<"Chamado"> | Date | string
    updatedAt?: DateTimeFilter<"Chamado"> | Date | string
    atendente?: XOR<UserNullableScalarRelationFilter, userWhereInput> | null
  }, "id" | "ticket">

  export type ChamadoOrderByWithAggregationInput = {
    id?: SortOrder
    ticket?: SortOrder
    nome?: SortOrder
    cpf?: SortOrder
    setor?: SortOrder
    descricao?: SortOrder
    historico?: SortOrderInput | SortOrder
    status?: SortOrder
    prioridade?: SortOrder
    anexoUrl?: SortOrderInput | SortOrder
    atendenteId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ChamadoCountOrderByAggregateInput
    _max?: ChamadoMaxOrderByAggregateInput
    _min?: ChamadoMinOrderByAggregateInput
  }

  export type ChamadoScalarWhereWithAggregatesInput = {
    AND?: ChamadoScalarWhereWithAggregatesInput | ChamadoScalarWhereWithAggregatesInput[]
    OR?: ChamadoScalarWhereWithAggregatesInput[]
    NOT?: ChamadoScalarWhereWithAggregatesInput | ChamadoScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Chamado"> | string
    ticket?: StringWithAggregatesFilter<"Chamado"> | string
    nome?: StringWithAggregatesFilter<"Chamado"> | string
    cpf?: StringWithAggregatesFilter<"Chamado"> | string
    setor?: StringWithAggregatesFilter<"Chamado"> | string
    descricao?: StringWithAggregatesFilter<"Chamado"> | string
    historico?: StringNullableWithAggregatesFilter<"Chamado"> | string | null
    status?: StringWithAggregatesFilter<"Chamado"> | string
    prioridade?: StringWithAggregatesFilter<"Chamado"> | string
    anexoUrl?: StringNullableWithAggregatesFilter<"Chamado"> | string | null
    atendenteId?: StringNullableWithAggregatesFilter<"Chamado"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Chamado"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Chamado"> | Date | string
  }

  export type cpfsWhereInput = {
    AND?: cpfsWhereInput | cpfsWhereInput[]
    OR?: cpfsWhereInput[]
    NOT?: cpfsWhereInput | cpfsWhereInput[]
    id?: StringFilter<"cpfs"> | string
    cpf?: StringFilter<"cpfs"> | string
    nome?: StringFilter<"cpfs"> | string
    createdAt?: DateTimeFilter<"cpfs"> | Date | string
    updatedAt?: DateTimeFilter<"cpfs"> | Date | string
  }

  export type cpfsOrderByWithRelationInput = {
    id?: SortOrder
    cpf?: SortOrder
    nome?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type cpfsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    cpf?: string
    AND?: cpfsWhereInput | cpfsWhereInput[]
    OR?: cpfsWhereInput[]
    NOT?: cpfsWhereInput | cpfsWhereInput[]
    nome?: StringFilter<"cpfs"> | string
    createdAt?: DateTimeFilter<"cpfs"> | Date | string
    updatedAt?: DateTimeFilter<"cpfs"> | Date | string
  }, "id" | "cpf">

  export type cpfsOrderByWithAggregationInput = {
    id?: SortOrder
    cpf?: SortOrder
    nome?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: cpfsCountOrderByAggregateInput
    _max?: cpfsMaxOrderByAggregateInput
    _min?: cpfsMinOrderByAggregateInput
  }

  export type cpfsScalarWhereWithAggregatesInput = {
    AND?: cpfsScalarWhereWithAggregatesInput | cpfsScalarWhereWithAggregatesInput[]
    OR?: cpfsScalarWhereWithAggregatesInput[]
    NOT?: cpfsScalarWhereWithAggregatesInput | cpfsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"cpfs"> | string
    cpf?: StringWithAggregatesFilter<"cpfs"> | string
    nome?: StringWithAggregatesFilter<"cpfs"> | string
    createdAt?: DateTimeWithAggregatesFilter<"cpfs"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"cpfs"> | Date | string
  }

  export type tickets_fechadosWhereInput = {
    AND?: tickets_fechadosWhereInput | tickets_fechadosWhereInput[]
    OR?: tickets_fechadosWhereInput[]
    NOT?: tickets_fechadosWhereInput | tickets_fechadosWhereInput[]
    id?: StringFilter<"tickets_fechados"> | string
    ticket?: StringFilter<"tickets_fechados"> | string
    nome?: StringFilter<"tickets_fechados"> | string
    cpf?: StringFilter<"tickets_fechados"> | string
    setor?: StringFilter<"tickets_fechados"> | string
    historico?: StringNullableFilter<"tickets_fechados"> | string | null
    prioridade?: StringFilter<"tickets_fechados"> | string
    anexoUrl?: StringNullableFilter<"tickets_fechados"> | string | null
    atendente?: StringNullableFilter<"tickets_fechados"> | string | null
    createdAt?: DateTimeFilter<"tickets_fechados"> | Date | string
    updatedAt?: DateTimeFilter<"tickets_fechados"> | Date | string
  }

  export type tickets_fechadosOrderByWithRelationInput = {
    id?: SortOrder
    ticket?: SortOrder
    nome?: SortOrder
    cpf?: SortOrder
    setor?: SortOrder
    historico?: SortOrderInput | SortOrder
    prioridade?: SortOrder
    anexoUrl?: SortOrderInput | SortOrder
    atendente?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type tickets_fechadosWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    ticket?: string
    AND?: tickets_fechadosWhereInput | tickets_fechadosWhereInput[]
    OR?: tickets_fechadosWhereInput[]
    NOT?: tickets_fechadosWhereInput | tickets_fechadosWhereInput[]
    nome?: StringFilter<"tickets_fechados"> | string
    cpf?: StringFilter<"tickets_fechados"> | string
    setor?: StringFilter<"tickets_fechados"> | string
    historico?: StringNullableFilter<"tickets_fechados"> | string | null
    prioridade?: StringFilter<"tickets_fechados"> | string
    anexoUrl?: StringNullableFilter<"tickets_fechados"> | string | null
    atendente?: StringNullableFilter<"tickets_fechados"> | string | null
    createdAt?: DateTimeFilter<"tickets_fechados"> | Date | string
    updatedAt?: DateTimeFilter<"tickets_fechados"> | Date | string
  }, "id" | "ticket">

  export type tickets_fechadosOrderByWithAggregationInput = {
    id?: SortOrder
    ticket?: SortOrder
    nome?: SortOrder
    cpf?: SortOrder
    setor?: SortOrder
    historico?: SortOrderInput | SortOrder
    prioridade?: SortOrder
    anexoUrl?: SortOrderInput | SortOrder
    atendente?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: tickets_fechadosCountOrderByAggregateInput
    _max?: tickets_fechadosMaxOrderByAggregateInput
    _min?: tickets_fechadosMinOrderByAggregateInput
  }

  export type tickets_fechadosScalarWhereWithAggregatesInput = {
    AND?: tickets_fechadosScalarWhereWithAggregatesInput | tickets_fechadosScalarWhereWithAggregatesInput[]
    OR?: tickets_fechadosScalarWhereWithAggregatesInput[]
    NOT?: tickets_fechadosScalarWhereWithAggregatesInput | tickets_fechadosScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"tickets_fechados"> | string
    ticket?: StringWithAggregatesFilter<"tickets_fechados"> | string
    nome?: StringWithAggregatesFilter<"tickets_fechados"> | string
    cpf?: StringWithAggregatesFilter<"tickets_fechados"> | string
    setor?: StringWithAggregatesFilter<"tickets_fechados"> | string
    historico?: StringNullableWithAggregatesFilter<"tickets_fechados"> | string | null
    prioridade?: StringWithAggregatesFilter<"tickets_fechados"> | string
    anexoUrl?: StringNullableWithAggregatesFilter<"tickets_fechados"> | string | null
    atendente?: StringNullableWithAggregatesFilter<"tickets_fechados"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"tickets_fechados"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"tickets_fechados"> | Date | string
  }

  export type avisosWhereInput = {
    AND?: avisosWhereInput | avisosWhereInput[]
    OR?: avisosWhereInput[]
    NOT?: avisosWhereInput | avisosWhereInput[]
    id?: StringFilter<"avisos"> | string
    titulo?: StringFilter<"avisos"> | string
    conteudo?: StringFilter<"avisos"> | string
    setor?: StringNullableFilter<"avisos"> | string | null
    duracao?: StringNullableFilter<"avisos"> | string | null
    expiresAt?: DateTimeNullableFilter<"avisos"> | Date | string | null
    createdAt?: DateTimeFilter<"avisos"> | Date | string
    updatedAt?: DateTimeFilter<"avisos"> | Date | string
  }

  export type avisosOrderByWithRelationInput = {
    id?: SortOrder
    titulo?: SortOrder
    conteudo?: SortOrder
    setor?: SortOrderInput | SortOrder
    duracao?: SortOrderInput | SortOrder
    expiresAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type avisosWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: avisosWhereInput | avisosWhereInput[]
    OR?: avisosWhereInput[]
    NOT?: avisosWhereInput | avisosWhereInput[]
    titulo?: StringFilter<"avisos"> | string
    conteudo?: StringFilter<"avisos"> | string
    setor?: StringNullableFilter<"avisos"> | string | null
    duracao?: StringNullableFilter<"avisos"> | string | null
    expiresAt?: DateTimeNullableFilter<"avisos"> | Date | string | null
    createdAt?: DateTimeFilter<"avisos"> | Date | string
    updatedAt?: DateTimeFilter<"avisos"> | Date | string
  }, "id">

  export type avisosOrderByWithAggregationInput = {
    id?: SortOrder
    titulo?: SortOrder
    conteudo?: SortOrder
    setor?: SortOrderInput | SortOrder
    duracao?: SortOrderInput | SortOrder
    expiresAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: avisosCountOrderByAggregateInput
    _max?: avisosMaxOrderByAggregateInput
    _min?: avisosMinOrderByAggregateInput
  }

  export type avisosScalarWhereWithAggregatesInput = {
    AND?: avisosScalarWhereWithAggregatesInput | avisosScalarWhereWithAggregatesInput[]
    OR?: avisosScalarWhereWithAggregatesInput[]
    NOT?: avisosScalarWhereWithAggregatesInput | avisosScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"avisos"> | string
    titulo?: StringWithAggregatesFilter<"avisos"> | string
    conteudo?: StringWithAggregatesFilter<"avisos"> | string
    setor?: StringNullableWithAggregatesFilter<"avisos"> | string | null
    duracao?: StringNullableWithAggregatesFilter<"avisos"> | string | null
    expiresAt?: DateTimeNullableWithAggregatesFilter<"avisos"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"avisos"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"avisos"> | Date | string
  }

  export type resumoPersonaWhereInput = {
    AND?: resumoPersonaWhereInput | resumoPersonaWhereInput[]
    OR?: resumoPersonaWhereInput[]
    NOT?: resumoPersonaWhereInput | resumoPersonaWhereInput[]
    id?: StringFilter<"resumoPersona"> | string
    cpf?: StringFilter<"resumoPersona"> | string
    nome?: StringFilter<"resumoPersona"> | string
    resumo?: StringFilter<"resumoPersona"> | string
    createdAt?: DateTimeFilter<"resumoPersona"> | Date | string
    updatedAt?: DateTimeFilter<"resumoPersona"> | Date | string
  }

  export type resumoPersonaOrderByWithRelationInput = {
    id?: SortOrder
    cpf?: SortOrder
    nome?: SortOrder
    resumo?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type resumoPersonaWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    cpf?: string
    AND?: resumoPersonaWhereInput | resumoPersonaWhereInput[]
    OR?: resumoPersonaWhereInput[]
    NOT?: resumoPersonaWhereInput | resumoPersonaWhereInput[]
    nome?: StringFilter<"resumoPersona"> | string
    resumo?: StringFilter<"resumoPersona"> | string
    createdAt?: DateTimeFilter<"resumoPersona"> | Date | string
    updatedAt?: DateTimeFilter<"resumoPersona"> | Date | string
  }, "id" | "cpf">

  export type resumoPersonaOrderByWithAggregationInput = {
    id?: SortOrder
    cpf?: SortOrder
    nome?: SortOrder
    resumo?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: resumoPersonaCountOrderByAggregateInput
    _max?: resumoPersonaMaxOrderByAggregateInput
    _min?: resumoPersonaMinOrderByAggregateInput
  }

  export type resumoPersonaScalarWhereWithAggregatesInput = {
    AND?: resumoPersonaScalarWhereWithAggregatesInput | resumoPersonaScalarWhereWithAggregatesInput[]
    OR?: resumoPersonaScalarWhereWithAggregatesInput[]
    NOT?: resumoPersonaScalarWhereWithAggregatesInput | resumoPersonaScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"resumoPersona"> | string
    cpf?: StringWithAggregatesFilter<"resumoPersona"> | string
    nome?: StringWithAggregatesFilter<"resumoPersona"> | string
    resumo?: StringWithAggregatesFilter<"resumoPersona"> | string
    createdAt?: DateTimeWithAggregatesFilter<"resumoPersona"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"resumoPersona"> | Date | string
  }

  export type userCreateInput = {
    id?: string
    email: string
    cpf: string
    name: string
    role: $Enums.ROLE
    avatarUrl?: string | null
    setor: string
    resumo?: string | null
    password: string
    createdAt?: Date | string
    updatedAt?: Date | string
    chamados?: ChamadoCreateNestedManyWithoutAtendenteInput
  }

  export type userUncheckedCreateInput = {
    id?: string
    email: string
    cpf: string
    name: string
    role: $Enums.ROLE
    avatarUrl?: string | null
    setor: string
    resumo?: string | null
    password: string
    createdAt?: Date | string
    updatedAt?: Date | string
    chamados?: ChamadoUncheckedCreateNestedManyWithoutAtendenteInput
  }

  export type userUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumROLEFieldUpdateOperationsInput | $Enums.ROLE
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    setor?: StringFieldUpdateOperationsInput | string
    resumo?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    chamados?: ChamadoUpdateManyWithoutAtendenteNestedInput
  }

  export type userUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumROLEFieldUpdateOperationsInput | $Enums.ROLE
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    setor?: StringFieldUpdateOperationsInput | string
    resumo?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    chamados?: ChamadoUncheckedUpdateManyWithoutAtendenteNestedInput
  }

  export type userCreateManyInput = {
    id?: string
    email: string
    cpf: string
    name: string
    role: $Enums.ROLE
    avatarUrl?: string | null
    setor: string
    resumo?: string | null
    password: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type userUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumROLEFieldUpdateOperationsInput | $Enums.ROLE
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    setor?: StringFieldUpdateOperationsInput | string
    resumo?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type userUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumROLEFieldUpdateOperationsInput | $Enums.ROLE
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    setor?: StringFieldUpdateOperationsInput | string
    resumo?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChamadoCreateInput = {
    id?: string
    ticket: string
    nome: string
    cpf: string
    setor: string
    descricao: string
    historico?: string | null
    status?: string
    prioridade?: string
    anexoUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    atendente?: userCreateNestedOneWithoutChamadosInput
  }

  export type ChamadoUncheckedCreateInput = {
    id?: string
    ticket: string
    nome: string
    cpf: string
    setor: string
    descricao: string
    historico?: string | null
    status?: string
    prioridade?: string
    anexoUrl?: string | null
    atendenteId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ChamadoUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticket?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    setor?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    historico?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    prioridade?: StringFieldUpdateOperationsInput | string
    anexoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    atendente?: userUpdateOneWithoutChamadosNestedInput
  }

  export type ChamadoUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticket?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    setor?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    historico?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    prioridade?: StringFieldUpdateOperationsInput | string
    anexoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    atendenteId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChamadoCreateManyInput = {
    id?: string
    ticket: string
    nome: string
    cpf: string
    setor: string
    descricao: string
    historico?: string | null
    status?: string
    prioridade?: string
    anexoUrl?: string | null
    atendenteId?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ChamadoUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticket?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    setor?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    historico?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    prioridade?: StringFieldUpdateOperationsInput | string
    anexoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChamadoUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticket?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    setor?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    historico?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    prioridade?: StringFieldUpdateOperationsInput | string
    anexoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    atendenteId?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type cpfsCreateInput = {
    id?: string
    cpf: string
    nome: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type cpfsUncheckedCreateInput = {
    id?: string
    cpf: string
    nome: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type cpfsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type cpfsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type cpfsCreateManyInput = {
    id?: string
    cpf: string
    nome: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type cpfsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type cpfsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type tickets_fechadosCreateInput = {
    id?: string
    ticket: string
    nome: string
    cpf: string
    setor: string
    historico?: string | null
    prioridade: string
    anexoUrl?: string | null
    atendente?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type tickets_fechadosUncheckedCreateInput = {
    id?: string
    ticket: string
    nome: string
    cpf: string
    setor: string
    historico?: string | null
    prioridade: string
    anexoUrl?: string | null
    atendente?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type tickets_fechadosUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticket?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    setor?: StringFieldUpdateOperationsInput | string
    historico?: NullableStringFieldUpdateOperationsInput | string | null
    prioridade?: StringFieldUpdateOperationsInput | string
    anexoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    atendente?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type tickets_fechadosUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticket?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    setor?: StringFieldUpdateOperationsInput | string
    historico?: NullableStringFieldUpdateOperationsInput | string | null
    prioridade?: StringFieldUpdateOperationsInput | string
    anexoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    atendente?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type tickets_fechadosCreateManyInput = {
    id?: string
    ticket: string
    nome: string
    cpf: string
    setor: string
    historico?: string | null
    prioridade: string
    anexoUrl?: string | null
    atendente?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type tickets_fechadosUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticket?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    setor?: StringFieldUpdateOperationsInput | string
    historico?: NullableStringFieldUpdateOperationsInput | string | null
    prioridade?: StringFieldUpdateOperationsInput | string
    anexoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    atendente?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type tickets_fechadosUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticket?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    setor?: StringFieldUpdateOperationsInput | string
    historico?: NullableStringFieldUpdateOperationsInput | string | null
    prioridade?: StringFieldUpdateOperationsInput | string
    anexoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    atendente?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type avisosCreateInput = {
    id?: string
    titulo: string
    conteudo: string
    setor?: string | null
    duracao?: string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type avisosUncheckedCreateInput = {
    id?: string
    titulo: string
    conteudo: string
    setor?: string | null
    duracao?: string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type avisosUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    conteudo?: StringFieldUpdateOperationsInput | string
    setor?: NullableStringFieldUpdateOperationsInput | string | null
    duracao?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type avisosUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    conteudo?: StringFieldUpdateOperationsInput | string
    setor?: NullableStringFieldUpdateOperationsInput | string | null
    duracao?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type avisosCreateManyInput = {
    id?: string
    titulo: string
    conteudo: string
    setor?: string | null
    duracao?: string | null
    expiresAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type avisosUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    conteudo?: StringFieldUpdateOperationsInput | string
    setor?: NullableStringFieldUpdateOperationsInput | string | null
    duracao?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type avisosUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    titulo?: StringFieldUpdateOperationsInput | string
    conteudo?: StringFieldUpdateOperationsInput | string
    setor?: NullableStringFieldUpdateOperationsInput | string | null
    duracao?: NullableStringFieldUpdateOperationsInput | string | null
    expiresAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type resumoPersonaCreateInput = {
    id?: string
    cpf: string
    nome: string
    resumo: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type resumoPersonaUncheckedCreateInput = {
    id?: string
    cpf: string
    nome: string
    resumo: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type resumoPersonaUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    resumo?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type resumoPersonaUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    resumo?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type resumoPersonaCreateManyInput = {
    id?: string
    cpf: string
    nome: string
    resumo: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type resumoPersonaUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    resumo?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type resumoPersonaUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    resumo?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type EnumROLEFilter<$PrismaModel = never> = {
    equals?: $Enums.ROLE | EnumROLEFieldRefInput<$PrismaModel>
    in?: $Enums.ROLE[] | ListEnumROLEFieldRefInput<$PrismaModel>
    notIn?: $Enums.ROLE[] | ListEnumROLEFieldRefInput<$PrismaModel>
    not?: NestedEnumROLEFilter<$PrismaModel> | $Enums.ROLE
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type ChamadoListRelationFilter = {
    every?: ChamadoWhereInput
    some?: ChamadoWhereInput
    none?: ChamadoWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ChamadoOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type userCountOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    cpf?: SortOrder
    name?: SortOrder
    role?: SortOrder
    avatarUrl?: SortOrder
    setor?: SortOrder
    resumo?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type userMaxOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    cpf?: SortOrder
    name?: SortOrder
    role?: SortOrder
    avatarUrl?: SortOrder
    setor?: SortOrder
    resumo?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type userMinOrderByAggregateInput = {
    id?: SortOrder
    email?: SortOrder
    cpf?: SortOrder
    name?: SortOrder
    role?: SortOrder
    avatarUrl?: SortOrder
    setor?: SortOrder
    resumo?: SortOrder
    password?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type EnumROLEWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ROLE | EnumROLEFieldRefInput<$PrismaModel>
    in?: $Enums.ROLE[] | ListEnumROLEFieldRefInput<$PrismaModel>
    notIn?: $Enums.ROLE[] | ListEnumROLEFieldRefInput<$PrismaModel>
    not?: NestedEnumROLEWithAggregatesFilter<$PrismaModel> | $Enums.ROLE
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumROLEFilter<$PrismaModel>
    _max?: NestedEnumROLEFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type UserNullableScalarRelationFilter = {
    is?: userWhereInput | null
    isNot?: userWhereInput | null
  }

  export type ChamadoCountOrderByAggregateInput = {
    id?: SortOrder
    ticket?: SortOrder
    nome?: SortOrder
    cpf?: SortOrder
    setor?: SortOrder
    descricao?: SortOrder
    historico?: SortOrder
    status?: SortOrder
    prioridade?: SortOrder
    anexoUrl?: SortOrder
    atendenteId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ChamadoMaxOrderByAggregateInput = {
    id?: SortOrder
    ticket?: SortOrder
    nome?: SortOrder
    cpf?: SortOrder
    setor?: SortOrder
    descricao?: SortOrder
    historico?: SortOrder
    status?: SortOrder
    prioridade?: SortOrder
    anexoUrl?: SortOrder
    atendenteId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ChamadoMinOrderByAggregateInput = {
    id?: SortOrder
    ticket?: SortOrder
    nome?: SortOrder
    cpf?: SortOrder
    setor?: SortOrder
    descricao?: SortOrder
    historico?: SortOrder
    status?: SortOrder
    prioridade?: SortOrder
    anexoUrl?: SortOrder
    atendenteId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type cpfsCountOrderByAggregateInput = {
    id?: SortOrder
    cpf?: SortOrder
    nome?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type cpfsMaxOrderByAggregateInput = {
    id?: SortOrder
    cpf?: SortOrder
    nome?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type cpfsMinOrderByAggregateInput = {
    id?: SortOrder
    cpf?: SortOrder
    nome?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type tickets_fechadosCountOrderByAggregateInput = {
    id?: SortOrder
    ticket?: SortOrder
    nome?: SortOrder
    cpf?: SortOrder
    setor?: SortOrder
    historico?: SortOrder
    prioridade?: SortOrder
    anexoUrl?: SortOrder
    atendente?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type tickets_fechadosMaxOrderByAggregateInput = {
    id?: SortOrder
    ticket?: SortOrder
    nome?: SortOrder
    cpf?: SortOrder
    setor?: SortOrder
    historico?: SortOrder
    prioridade?: SortOrder
    anexoUrl?: SortOrder
    atendente?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type tickets_fechadosMinOrderByAggregateInput = {
    id?: SortOrder
    ticket?: SortOrder
    nome?: SortOrder
    cpf?: SortOrder
    setor?: SortOrder
    historico?: SortOrder
    prioridade?: SortOrder
    anexoUrl?: SortOrder
    atendente?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type avisosCountOrderByAggregateInput = {
    id?: SortOrder
    titulo?: SortOrder
    conteudo?: SortOrder
    setor?: SortOrder
    duracao?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type avisosMaxOrderByAggregateInput = {
    id?: SortOrder
    titulo?: SortOrder
    conteudo?: SortOrder
    setor?: SortOrder
    duracao?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type avisosMinOrderByAggregateInput = {
    id?: SortOrder
    titulo?: SortOrder
    conteudo?: SortOrder
    setor?: SortOrder
    duracao?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type resumoPersonaCountOrderByAggregateInput = {
    id?: SortOrder
    cpf?: SortOrder
    nome?: SortOrder
    resumo?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type resumoPersonaMaxOrderByAggregateInput = {
    id?: SortOrder
    cpf?: SortOrder
    nome?: SortOrder
    resumo?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type resumoPersonaMinOrderByAggregateInput = {
    id?: SortOrder
    cpf?: SortOrder
    nome?: SortOrder
    resumo?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ChamadoCreateNestedManyWithoutAtendenteInput = {
    create?: XOR<ChamadoCreateWithoutAtendenteInput, ChamadoUncheckedCreateWithoutAtendenteInput> | ChamadoCreateWithoutAtendenteInput[] | ChamadoUncheckedCreateWithoutAtendenteInput[]
    connectOrCreate?: ChamadoCreateOrConnectWithoutAtendenteInput | ChamadoCreateOrConnectWithoutAtendenteInput[]
    createMany?: ChamadoCreateManyAtendenteInputEnvelope
    connect?: ChamadoWhereUniqueInput | ChamadoWhereUniqueInput[]
  }

  export type ChamadoUncheckedCreateNestedManyWithoutAtendenteInput = {
    create?: XOR<ChamadoCreateWithoutAtendenteInput, ChamadoUncheckedCreateWithoutAtendenteInput> | ChamadoCreateWithoutAtendenteInput[] | ChamadoUncheckedCreateWithoutAtendenteInput[]
    connectOrCreate?: ChamadoCreateOrConnectWithoutAtendenteInput | ChamadoCreateOrConnectWithoutAtendenteInput[]
    createMany?: ChamadoCreateManyAtendenteInputEnvelope
    connect?: ChamadoWhereUniqueInput | ChamadoWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type EnumROLEFieldUpdateOperationsInput = {
    set?: $Enums.ROLE
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type ChamadoUpdateManyWithoutAtendenteNestedInput = {
    create?: XOR<ChamadoCreateWithoutAtendenteInput, ChamadoUncheckedCreateWithoutAtendenteInput> | ChamadoCreateWithoutAtendenteInput[] | ChamadoUncheckedCreateWithoutAtendenteInput[]
    connectOrCreate?: ChamadoCreateOrConnectWithoutAtendenteInput | ChamadoCreateOrConnectWithoutAtendenteInput[]
    upsert?: ChamadoUpsertWithWhereUniqueWithoutAtendenteInput | ChamadoUpsertWithWhereUniqueWithoutAtendenteInput[]
    createMany?: ChamadoCreateManyAtendenteInputEnvelope
    set?: ChamadoWhereUniqueInput | ChamadoWhereUniqueInput[]
    disconnect?: ChamadoWhereUniqueInput | ChamadoWhereUniqueInput[]
    delete?: ChamadoWhereUniqueInput | ChamadoWhereUniqueInput[]
    connect?: ChamadoWhereUniqueInput | ChamadoWhereUniqueInput[]
    update?: ChamadoUpdateWithWhereUniqueWithoutAtendenteInput | ChamadoUpdateWithWhereUniqueWithoutAtendenteInput[]
    updateMany?: ChamadoUpdateManyWithWhereWithoutAtendenteInput | ChamadoUpdateManyWithWhereWithoutAtendenteInput[]
    deleteMany?: ChamadoScalarWhereInput | ChamadoScalarWhereInput[]
  }

  export type ChamadoUncheckedUpdateManyWithoutAtendenteNestedInput = {
    create?: XOR<ChamadoCreateWithoutAtendenteInput, ChamadoUncheckedCreateWithoutAtendenteInput> | ChamadoCreateWithoutAtendenteInput[] | ChamadoUncheckedCreateWithoutAtendenteInput[]
    connectOrCreate?: ChamadoCreateOrConnectWithoutAtendenteInput | ChamadoCreateOrConnectWithoutAtendenteInput[]
    upsert?: ChamadoUpsertWithWhereUniqueWithoutAtendenteInput | ChamadoUpsertWithWhereUniqueWithoutAtendenteInput[]
    createMany?: ChamadoCreateManyAtendenteInputEnvelope
    set?: ChamadoWhereUniqueInput | ChamadoWhereUniqueInput[]
    disconnect?: ChamadoWhereUniqueInput | ChamadoWhereUniqueInput[]
    delete?: ChamadoWhereUniqueInput | ChamadoWhereUniqueInput[]
    connect?: ChamadoWhereUniqueInput | ChamadoWhereUniqueInput[]
    update?: ChamadoUpdateWithWhereUniqueWithoutAtendenteInput | ChamadoUpdateWithWhereUniqueWithoutAtendenteInput[]
    updateMany?: ChamadoUpdateManyWithWhereWithoutAtendenteInput | ChamadoUpdateManyWithWhereWithoutAtendenteInput[]
    deleteMany?: ChamadoScalarWhereInput | ChamadoScalarWhereInput[]
  }

  export type userCreateNestedOneWithoutChamadosInput = {
    create?: XOR<userCreateWithoutChamadosInput, userUncheckedCreateWithoutChamadosInput>
    connectOrCreate?: userCreateOrConnectWithoutChamadosInput
    connect?: userWhereUniqueInput
  }

  export type userUpdateOneWithoutChamadosNestedInput = {
    create?: XOR<userCreateWithoutChamadosInput, userUncheckedCreateWithoutChamadosInput>
    connectOrCreate?: userCreateOrConnectWithoutChamadosInput
    upsert?: userUpsertWithoutChamadosInput
    disconnect?: userWhereInput | boolean
    delete?: userWhereInput | boolean
    connect?: userWhereUniqueInput
    update?: XOR<XOR<userUpdateToOneWithWhereWithoutChamadosInput, userUpdateWithoutChamadosInput>, userUncheckedUpdateWithoutChamadosInput>
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedEnumROLEFilter<$PrismaModel = never> = {
    equals?: $Enums.ROLE | EnumROLEFieldRefInput<$PrismaModel>
    in?: $Enums.ROLE[] | ListEnumROLEFieldRefInput<$PrismaModel>
    notIn?: $Enums.ROLE[] | ListEnumROLEFieldRefInput<$PrismaModel>
    not?: NestedEnumROLEFilter<$PrismaModel> | $Enums.ROLE
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedEnumROLEWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ROLE | EnumROLEFieldRefInput<$PrismaModel>
    in?: $Enums.ROLE[] | ListEnumROLEFieldRefInput<$PrismaModel>
    notIn?: $Enums.ROLE[] | ListEnumROLEFieldRefInput<$PrismaModel>
    not?: NestedEnumROLEWithAggregatesFilter<$PrismaModel> | $Enums.ROLE
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumROLEFilter<$PrismaModel>
    _max?: NestedEnumROLEFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type ChamadoCreateWithoutAtendenteInput = {
    id?: string
    ticket: string
    nome: string
    cpf: string
    setor: string
    descricao: string
    historico?: string | null
    status?: string
    prioridade?: string
    anexoUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ChamadoUncheckedCreateWithoutAtendenteInput = {
    id?: string
    ticket: string
    nome: string
    cpf: string
    setor: string
    descricao: string
    historico?: string | null
    status?: string
    prioridade?: string
    anexoUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ChamadoCreateOrConnectWithoutAtendenteInput = {
    where: ChamadoWhereUniqueInput
    create: XOR<ChamadoCreateWithoutAtendenteInput, ChamadoUncheckedCreateWithoutAtendenteInput>
  }

  export type ChamadoCreateManyAtendenteInputEnvelope = {
    data: ChamadoCreateManyAtendenteInput | ChamadoCreateManyAtendenteInput[]
    skipDuplicates?: boolean
  }

  export type ChamadoUpsertWithWhereUniqueWithoutAtendenteInput = {
    where: ChamadoWhereUniqueInput
    update: XOR<ChamadoUpdateWithoutAtendenteInput, ChamadoUncheckedUpdateWithoutAtendenteInput>
    create: XOR<ChamadoCreateWithoutAtendenteInput, ChamadoUncheckedCreateWithoutAtendenteInput>
  }

  export type ChamadoUpdateWithWhereUniqueWithoutAtendenteInput = {
    where: ChamadoWhereUniqueInput
    data: XOR<ChamadoUpdateWithoutAtendenteInput, ChamadoUncheckedUpdateWithoutAtendenteInput>
  }

  export type ChamadoUpdateManyWithWhereWithoutAtendenteInput = {
    where: ChamadoScalarWhereInput
    data: XOR<ChamadoUpdateManyMutationInput, ChamadoUncheckedUpdateManyWithoutAtendenteInput>
  }

  export type ChamadoScalarWhereInput = {
    AND?: ChamadoScalarWhereInput | ChamadoScalarWhereInput[]
    OR?: ChamadoScalarWhereInput[]
    NOT?: ChamadoScalarWhereInput | ChamadoScalarWhereInput[]
    id?: StringFilter<"Chamado"> | string
    ticket?: StringFilter<"Chamado"> | string
    nome?: StringFilter<"Chamado"> | string
    cpf?: StringFilter<"Chamado"> | string
    setor?: StringFilter<"Chamado"> | string
    descricao?: StringFilter<"Chamado"> | string
    historico?: StringNullableFilter<"Chamado"> | string | null
    status?: StringFilter<"Chamado"> | string
    prioridade?: StringFilter<"Chamado"> | string
    anexoUrl?: StringNullableFilter<"Chamado"> | string | null
    atendenteId?: StringNullableFilter<"Chamado"> | string | null
    createdAt?: DateTimeFilter<"Chamado"> | Date | string
    updatedAt?: DateTimeFilter<"Chamado"> | Date | string
  }

  export type userCreateWithoutChamadosInput = {
    id?: string
    email: string
    cpf: string
    name: string
    role: $Enums.ROLE
    avatarUrl?: string | null
    setor: string
    resumo?: string | null
    password: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type userUncheckedCreateWithoutChamadosInput = {
    id?: string
    email: string
    cpf: string
    name: string
    role: $Enums.ROLE
    avatarUrl?: string | null
    setor: string
    resumo?: string | null
    password: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type userCreateOrConnectWithoutChamadosInput = {
    where: userWhereUniqueInput
    create: XOR<userCreateWithoutChamadosInput, userUncheckedCreateWithoutChamadosInput>
  }

  export type userUpsertWithoutChamadosInput = {
    update: XOR<userUpdateWithoutChamadosInput, userUncheckedUpdateWithoutChamadosInput>
    create: XOR<userCreateWithoutChamadosInput, userUncheckedCreateWithoutChamadosInput>
    where?: userWhereInput
  }

  export type userUpdateToOneWithWhereWithoutChamadosInput = {
    where?: userWhereInput
    data: XOR<userUpdateWithoutChamadosInput, userUncheckedUpdateWithoutChamadosInput>
  }

  export type userUpdateWithoutChamadosInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumROLEFieldUpdateOperationsInput | $Enums.ROLE
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    setor?: StringFieldUpdateOperationsInput | string
    resumo?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type userUncheckedUpdateWithoutChamadosInput = {
    id?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    role?: EnumROLEFieldUpdateOperationsInput | $Enums.ROLE
    avatarUrl?: NullableStringFieldUpdateOperationsInput | string | null
    setor?: StringFieldUpdateOperationsInput | string
    resumo?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChamadoCreateManyAtendenteInput = {
    id?: string
    ticket: string
    nome: string
    cpf: string
    setor: string
    descricao: string
    historico?: string | null
    status?: string
    prioridade?: string
    anexoUrl?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ChamadoUpdateWithoutAtendenteInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticket?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    setor?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    historico?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    prioridade?: StringFieldUpdateOperationsInput | string
    anexoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChamadoUncheckedUpdateWithoutAtendenteInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticket?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    setor?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    historico?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    prioridade?: StringFieldUpdateOperationsInput | string
    anexoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChamadoUncheckedUpdateManyWithoutAtendenteInput = {
    id?: StringFieldUpdateOperationsInput | string
    ticket?: StringFieldUpdateOperationsInput | string
    nome?: StringFieldUpdateOperationsInput | string
    cpf?: StringFieldUpdateOperationsInput | string
    setor?: StringFieldUpdateOperationsInput | string
    descricao?: StringFieldUpdateOperationsInput | string
    historico?: NullableStringFieldUpdateOperationsInput | string | null
    status?: StringFieldUpdateOperationsInput | string
    prioridade?: StringFieldUpdateOperationsInput | string
    anexoUrl?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}