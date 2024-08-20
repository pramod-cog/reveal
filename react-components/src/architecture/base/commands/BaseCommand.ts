/*!
 * Copyright 2024 Cognite AS
 */

import { type TranslateDelegate, type TranslateKey } from '../utilities/TranslateKey';
import { clear, remove } from '../utilities/extensions/arrayExtensions';

type UpdateDelegate = (command: BaseCommand) => void;

/**
 * Base class for all command and tools. These are object that can do a
 * user interaction with the system. It also have enough information to
 * generate the UI for the command.
 */

export abstract class BaseCommand {
  private static _counter: number = 0; // Counter for the unique index

  // ==================================================
  // INSTANCE FIELDS
  // ==================================================

  private readonly _listeners: UpdateDelegate[] = [];

  // Unique id for the command, used by in React to force rerender
  // when the command changes for a button.
  private readonly _uniqueId: number;

  public get uniqueId(): number {
    return this._uniqueId;
  }

  // ==================================================
  // CONSTRUCTOR
  // ==================================================

  public constructor() {
    BaseCommand._counter++;
    this._uniqueId = BaseCommand._counter;
  }

  // ==================================================
  // VIRTUAL METHODS (To be overridden)
  // =================================================

  public get name(): string {
    return this.tooltip.fallback;
  }

  public get shortCutKey(): string | undefined {
    return undefined;
  }

  public get shortCutKeyOnCtrl(): boolean {
    return false;
  }

  public get shortCutKeyOnShift(): boolean {
    return false;
  }

  public get tooltip(): TranslateKey {
    return { fallback: '' };
  }

  public get icon(): string | undefined {
    return undefined; // Means no icon
  }

  public get buttonType(): string {
    return 'ghost';
  }

  public get isEnabled(): boolean {
    return true;
  }

  public get isVisible(): boolean {
    return this.isEnabled;
  }

  /**
   * Gets a value indicating whether the command can be toggled on or off.
   * Override this property if the command can be toggled.
   * You must also override isChecked to get the toggle state.
   */
  public get isToggle(): boolean {
    return false;
  }

  public get isChecked(): boolean {
    return false;
  }

  /**
   * Gets a value indicating whether the command has data, for instance a reference
   * to a specific domain object. Then the command cannot be reused or shared in the user interface.
   * These command will not be added to the commandsController for updating, so update will
   * not be done automatically. Typically used when the command is created for a specific domain object
   * in the DomainObjectPanel.
   */
  public get hasData(): boolean {
    return false;
  }

  protected *getChildren(): Generator<BaseCommand> {}

  /*
   * Called when the command is invoked
   * Return true if successful, false otherwise
   * Override this method to implement the command logic
   */
  protected invokeCore(): boolean {
    return false;
  }

  public equals(other: BaseCommand): boolean {
    return this.constructor === other.constructor;
  }

  public invoke(): boolean {
    return this.invokeCore();
  }

  public dispose(): void {
    this.removeEventListeners();
  }

  // ==================================================
  // INSTANCE METHODS: Event listeners
  // ==================================================

  public addEventListener(listener: UpdateDelegate): void {
    this._listeners.push(listener);
  }

  public removeEventListener(listener: UpdateDelegate): void {
    remove(this._listeners, listener);
  }

  public removeEventListeners(): void {
    clear(this._listeners);
  }

  public update(): void {
    for (const listener of this._listeners) {
      listener(this);
    }
    for (const child of this.getChildren()) {
      child.update();
    }
  }

  // ==================================================
  // INSTANCE METHODS: Others
  // ==================================================

  public getLabel(translate: TranslateDelegate): string {
    const { key, fallback } = this.tooltip;
    if (key === undefined) {
      return fallback;
    }
    return translate(key, fallback);
  }

  public getShortCutKeys(): string[] | undefined {
    const key = this.shortCutKey;
    if (key === undefined) {
      return undefined;
    }
    const keys: string[] = [];
    if (this.shortCutKeyOnCtrl) {
      keys.push('Ctrl');
    }
    if (this.shortCutKeyOnShift) {
      keys.push('Shift');
    }
    keys.push(key);
    return keys;
  }
}
