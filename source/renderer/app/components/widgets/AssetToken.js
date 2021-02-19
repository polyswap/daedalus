// @flow
import React, { Component, Fragment as F } from 'react';
import SVGInline from 'react-svg-inline';
import classnames from 'classnames';
import { PopOver } from 'react-polymorph/lib/components/PopOver';
import { defineMessages, intlShape } from 'react-intl';
import CopyToClipboard from 'react-copy-to-clipboard';
import { observer } from 'mobx-react';
import styles from './AssetToken.scss';
import { ellipsis } from '../../utils/strings';
import type { WalletSummaryAsset } from '../../api/assets/types';
import copyIcon from '../../assets/images/copy-asset.inline.svg';
import copyCheckmarkIcon from '../../assets/images/check-w.inline.svg';
import {
  ASSET_TOKEN_ID_COPY_FEEDBACK,
  ASSET_TOKEN_DISPLAY_DELAY,
} from '../../config/timingConfig';

const messages = defineMessages({
  fingerprintItem: {
    id: 'widgets.assetToken.item.fingerprint',
    defaultMessage: '!!!Fingerprint',
    description: '"fingerprint" item.',
  },
  policyIdItem: {
    id: 'widgets.assetToken.item.policyId',
    defaultMessage: '!!!Policy Id',
    description: '"policyId" item.',
  },
  assetNameItem: {
    id: 'widgets.assetToken.item.assetName',
    defaultMessage: '!!!Asset Name',
    description: '"assetName" item.',
  },
  nameItem: {
    id: 'widgets.assetToken.item.name',
    defaultMessage: '!!!Name',
    description: '"name" item.',
  },
  acronymItem: {
    id: 'widgets.assetToken.item.acronym',
    defaultMessage: '!!!Acronym',
    description: '"acronym" item.',
  },
  descriptionItem: {
    id: 'widgets.assetToken.item.description',
    defaultMessage: '!!!Description',
    description: '"description" item.',
  },
});

type Props = {
  asset: WalletSummaryAsset,
  small?: boolean,
  hideTooltip?: boolean,
  onCopyAssetItem?: Function,
  // In case it's not possible to calculate the container width
  // this props defines after how many characters the `metadata.name` text will cut off
  metadataNameChars?: number,
};

type State = {
  isTooltipVisible: boolean,
  itemCopied: ?string,
};

@observer
export default class AssetToken extends Component<Props, State> {
  static contextTypes = {
    intl: intlShape.isRequired,
  };

  copyNotificationTimeout: TimeoutID;
  displayDelayTimeout: TimeoutID;

  state = {
    isTooltipVisible: false,
    itemCopied: null,
  };

  handleShowTooltip = () => {
    clearTimeout(this.displayDelayTimeout);
    this.displayDelayTimeout = setTimeout(() => {
      this.setState({
        isTooltipVisible: true,
      });
    }, ASSET_TOKEN_DISPLAY_DELAY);
  };

  handleHideTooltip = () => {
    clearTimeout(this.displayDelayTimeout);
    this.displayDelayTimeout = setTimeout(() => {
      this.setState({
        isTooltipVisible: false,
      });
    }, ASSET_TOKEN_DISPLAY_DELAY);
  };

  handleCopyItem = (itemCopied: string, assetItem: string, value: string) => {
    const { onCopyAssetItem } = this.props;
    if (onCopyAssetItem) {
      onCopyAssetItem(assetItem, value);
    }
    clearTimeout(this.copyNotificationTimeout);
    this.setState({
      itemCopied,
    });
    this.copyNotificationTimeout = setTimeout(() => {
      this.setState({ itemCopied: null });
    }, ASSET_TOKEN_ID_COPY_FEEDBACK);
  };

  contentRender() {
    const { asset, metadataNameChars, small } = this.props;
    const { fingerprint, metadata } = asset;
    const { name } = metadata || {};
    const contentStyles = classnames([
      styles.content,
      small ? styles.small : null,
    ]);
    return (
      <div className={contentStyles}>
        <div className={styles.fingerprint}>
          {ellipsis(fingerprint || '', 9, 4)}
        </div>
        {name && (
          <div className={styles.metadataName}>
            {metadataNameChars ? ellipsis(name, metadataNameChars) : name}
          </div>
        )}
      </div>
    );
  }

  assetItemRenderer = (
    assetId: string,
    assetItem: string,
    value: string,
    singleline?: boolean
  ) => {
    const { itemCopied } = this.state;
    const icon = itemCopied === assetId ? copyCheckmarkIcon : copyIcon;
    const iconClassnames = classnames([
      styles.copyIcon,
      itemCopied === assetId ? styles.copiedIcon : null,
    ]);
    const onCopy = () => {
      this.handleCopyItem(assetId, assetItem, value);
    };
    return (
      <CopyToClipboard text={value} onCopy={onCopy}>
        <div className={styles.assetItem}>
          <em className={singleline ? styles.singleline : null}>{value}</em>
          <SVGInline svg={icon} className={iconClassnames} />
        </div>
      </CopyToClipboard>
    );
  };

  tooltipRender() {
    const { intl } = this.context;
    const { asset } = this.props;
    const { fingerprint, policyId, assetName, metadata } = asset;
    const { name, acronym, description } = metadata || {};
    const item = this.assetItemRenderer;
    return (
      <div className={styles.tooltipContent}>
        <div className={styles.fingerprint}>
          {item('fingerprint', 'fingerprint', fingerprint)}
        </div>
        <dl>
          {acronym && (
            <F>
              <dt>{intl.formatMessage(messages.acronymItem)}</dt>
              <dd>
                {item(
                  'acronym',
                  intl.formatMessage(messages.acronymItem),
                  acronym
                )}
              </dd>
            </F>
          )}
          {name && (
            <F>
              <dt>{intl.formatMessage(messages.nameItem)}</dt>
              <dd>
                {item('name', intl.formatMessage(messages.nameItem), name)}
              </dd>
            </F>
          )}
          {description && (
            <F>
              <dt>{intl.formatMessage(messages.descriptionItem)}</dt>
              <dd>
                {item(
                  'description',
                  intl.formatMessage(messages.descriptionItem),
                  description,
                  true
                )}
              </dd>
            </F>
          )}
          <dt>{intl.formatMessage(messages.policyIdItem)}</dt>
          <dd>
            {item(
              'policyId',
              intl.formatMessage(messages.policyIdItem),
              policyId
            )}
          </dd>
          {assetName && (
            <F>
              <dt>{intl.formatMessage(messages.assetNameItem)}</dt>
              <dd>
                {item(
                  'assetName',
                  intl.formatMessage(messages.assetNameItem),
                  assetName
                )}
              </dd>
            </F>
          )}
        </dl>
      </div>
    );
  }

  render() {
    const children = this.contentRender();
    const { hideTooltip } = this.props;
    if (hideTooltip) return children;
    const { isTooltipVisible } = this.state;
    const tooltipContent = this.tooltipRender();
    return (
      <div
        className={styles.component}
        onMouseEnter={this.handleShowTooltip}
        onMouseLeave={this.handleHideTooltip}
      >
        <PopOver
          themeVariables={{
            '--rp-pop-over-bg-color':
              'var(--theme-widgets-asset-token-background-color)',
            '--rp-pop-over-text-color': 'var(--theme-bordered-box-text-color)',
            '--rp-pop-over-border-color':
              'var(--theme-staking-stake-pool-tooltip-border-color)',
            '--rp-pop-over-border-width': '1px',
            '--rp-pop-over-border-style': 'solid',
            '--rp-pop-over-box-shadow':
              '0 5px 20px 0 var(--theme-widgets-asset-token-box-shadow)',
          }}
          contentClassName={styles.popOver}
          content={tooltipContent}
          isShowingOnHover={false}
          isVisible={isTooltipVisible}
          appendTo="parent"
          allowHTML
        >
          {children}
        </PopOver>
      </div>
    );
  }
}