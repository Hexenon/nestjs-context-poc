/*!
 * Copyright 2020, Mothership Authors
 * Copyright 2019, OpenTelemetry Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Context } from './context';
import { IContextManager } from './context-manager';

export class NoopContextManager implements IContextManager {
  async init(): Promise<void> {
    return Promise.resolve();
  }

  active(): Context | undefined {
    return undefined;
  }

  with<T extends (...args: unknown[]) => ReturnType<T>>(
    context: Context,
    fn: T,
  ): ReturnType<T> {
    return fn();
  }

  bind<T>(target: T): T {
    return target;
  }

  enable(): this {
    return this;
  }

  disable(): this {
    return this;
  }
}
