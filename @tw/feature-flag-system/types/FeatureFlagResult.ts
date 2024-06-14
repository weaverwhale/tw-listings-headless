import {
  FeatureFlag,
  FeatureFlagBlockingMethod,
  FeatureFlagRankedControlListValue,
  FeatureFlagValueSource,
  FeatureFlagValueType,
  NullableFeatureFlagConfigValue,
  NullableFeatureFlagMetaData,
  NullableFeatureFlagValueWithMetaData,
} from './';

type OmitMethods<T extends object> = {
  [K in keyof T as T[K] extends Function ? never : K]: T[K];
};

export type FeatureFlagResultProperties = OmitMethods<FeatureFlagResult>;

export class FeatureFlagResult {
  private featureFlag: FeatureFlag | null = null;
  private showConsoleErrors: boolean = true;

  public readonly metadata: Readonly<NullableFeatureFlagMetaData> = {
    ffKey: null,
    description: '',
    valueType: null,
    combinationMethod: null,
    blockingMethod: null,
  };

  /**
   * @description Think twice before using this - class `FeatureFlagResult` has a variety of getters that cover most situations.
   */
  public readonly result: NullableFeatureFlagConfigValue = null;

  /**
   * @description Computed list of the sources of the configs that ended up deciding the final value for this feature flag.
   */
  public readonly sources: ReadonlyArray<FeatureFlagValueSource> | null = null;

  public constructor(args?: {
    metadata?: NullableFeatureFlagMetaData;
    result?: NullableFeatureFlagValueWithMetaData;
  }) {
    if (args) {
      const { metadata, result } = args;
      if (metadata !== undefined) this.metadata = metadata;
      if (result !== undefined) {
        this.result = result.value;
        this.sources = result.metadata.sources || null;
      }
    }
    this.featureFlag = this.metadata.ffKey || null;
  }

  private printWarning_NotMatchingValType(valueType: FeatureFlagValueType): void {
    if (!this.showConsoleErrors) return;

    console.warn(
      `Possible incorrect use of FeatureFlag "${this.featureFlag}".
       This FeatureFlag's valueType is ${valueType}.`
    );
  }

  /**
   * @description Method automatically used by JSON.stringify when attempting to stringify an object
   */
  public toJSON(): FeatureFlagResultProperties {
    // need to shut off and restart showing console errors for this case
    // , since we always want to see the all the values for all the limitations
    // even if the limitation doesn't match
    this.showConsoleErrors = false;

    const obj = {
      metadata: this.metadata,
      result: this.result,
      sources: this.sources,
      shouldBeBlocked: this.shouldBeBlocked,
      shouldBeHidden: this.shouldBeHidden,
      shouldNotBeSeen: this.shouldNotBeSeen,
      numericLimit: this.numericLimit,
      allowList: this.allowList,
      blockList: this.blockList,
      rankedControlList: this.rankedControlList,
    };

    this.showConsoleErrors = true;

    return obj;
  }

  /**
   * @description Determines if a single entity should be blocked
   * by another UI component.
   */
  public get shouldBeBlocked(): boolean {
    if (this.result === null) return false;

    const { valueType, blockingMethod } = this.metadata;

    if (valueType && valueType !== FeatureFlagValueType.Boolean) {
      this.printWarning_NotMatchingValType(valueType);
    }

    return (
      valueType === FeatureFlagValueType.Boolean &&
      blockingMethod === FeatureFlagBlockingMethod.Block &&
      this.result === false
    );
  }

  /**
   * @description Determines if a single entity should be hidden
   * instead of being blocked by a different UI component
   */
  public get shouldBeHidden(): boolean {
    if (!this.featureFlag || this.result === null) return false;

    const { valueType, blockingMethod } = this.metadata;

    if (valueType && valueType !== FeatureFlagValueType.Boolean) {
      this.printWarning_NotMatchingValType(valueType);
    }

    return (
      valueType === FeatureFlagValueType.Boolean &&
      blockingMethod === FeatureFlagBlockingMethod.Hide &&
      this.result === false
    );
  }

  /**
   * @description Checks if a component connected to this feature flag
   * should just not be seen - whether blocked or hidden. More lenient
   * option to quickly cover both cases.
   */
  public get shouldNotBeSeen(): boolean {
    if (!this.featureFlag || this.result === null) return false;

    const { valueType, blockingMethod } = this.metadata;
    const { Hide, Block } = FeatureFlagBlockingMethod;

    if (valueType && valueType !== FeatureFlagValueType.Boolean) {
      this.printWarning_NotMatchingValType(valueType);
    }

    return (
      valueType === FeatureFlagValueType.Boolean &&
      (blockingMethod === Hide || blockingMethod === Block) &&
      this.result === false
    );
  }

  /**
   * @description If the valueType of this feature flag is `Number`,
   * returns the number in that feature flag's result. If valueType
   * isn't `Number`, returns null.
   */
  public get numericLimit(): number | null {
    if (!this.featureFlag) return null;

    const { valueType } = this.metadata;
    if (valueType && valueType !== FeatureFlagValueType.Number) {
      this.printWarning_NotMatchingValType(valueType);
    }

    return typeof this.result === 'number' ? this.result : null;
  }

  /**
   * @description List of entities that this shop/user can access for this
   * feature flag.
   */
  public get allowList(): string[] {
    if (!Array.isArray(this.result) || !this.featureFlag) return [];

    const { valueType } = this.metadata;
    if (
      valueType &&
      valueType !== FeatureFlagValueType.AllowList &&
      valueType !== FeatureFlagValueType.RankedControlList
    ) {
      this.printWarning_NotMatchingValType(valueType);
    }

    if (valueType === FeatureFlagValueType.RankedControlList) {
      // TODO: Maybe do some validation here?
      return (this.result as FeatureFlagRankedControlListValue[])
        .filter((item) => item.type === 'allow')
        .map((item) => item.id);
    }

    if (valueType !== FeatureFlagValueType.AllowList) return [];

    return this.result as string[];
  }

  /**
   * @description List of entities that this shop/user can't access for this
   * feature flag.
   */
  public get blockList(): string[] {
    if (!Array.isArray(this.result) || !this.featureFlag) return [];

    const { valueType } = this.metadata;
    if (
      valueType &&
      valueType !== FeatureFlagValueType.BlockList &&
      valueType !== FeatureFlagValueType.RankedControlList
    ) {
      this.printWarning_NotMatchingValType(valueType);
    }

    if (valueType === FeatureFlagValueType.RankedControlList) {
      // TODO: Maybe do some validation here?
      return (this.result as FeatureFlagRankedControlListValue[])
        .filter((item) => item.type === 'block')
        .map((item) => item.id);
    }

    if (valueType !== FeatureFlagValueType.BlockList) return [];

    return this.result as string[];
  }
  /**
   * @description Mixed list of allowed/blocked entities
   */
  public get rankedControlList(): FeatureFlagRankedControlListValue[] {
    if (!Array.isArray(this.result) || !this.featureFlag) return [];

    const { valueType } = this.metadata;
    if (valueType && valueType !== FeatureFlagValueType.RankedControlList) {
      this.printWarning_NotMatchingValType(valueType);
      return [];
    }

    // TODO: Maybe do some validation here?
    return this.result as FeatureFlagRankedControlListValue[];
  }
}
