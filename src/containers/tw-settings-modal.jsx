import PropTypes from 'prop-types';
import React from 'react';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import bindAll from 'lodash.bindall';
import {connect} from 'react-redux';
import {closeSettingsModal} from '../reducers/modals';
import SettingsModalComponent from '../components/tw-settings-modal/settings-modal.jsx';
import twStageSize from '../lib/tw-stage-size';

const messages = defineMessages({
    confirmReload: {
        defaultMessage: 'A reload is required to change stage size, are you sure you want to reload?',
        description: 'Confirmation that user wants to reload to apply settings',
        id: 'tw.settingsModal.confirmReload'
    }
});

const isDefaultStageSize = (width, height) => width === 480 && height === 360;

class UsernameModal extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleClose',
            'handleHighQualityPenChange',
            'handleInterpolationChange',
            'handleInfiniteClonesChange',
            'handleRemoveFencingChange',
            'handleRemoveLimitsChange',
            'handleWarpTimerChange',
            'handleStageWidthChange',
            'handleStageHeightChange',
            'handleDisableCompilerChange'
        ]);
        this.state = {
            stageWidth: twStageSize.width,
            stageHeight: twStageSize.height,
            reloadRequired: false
        };
        this.isReloading = false;
    }
    handleClose () {
        if (this.isReloading) {
            return;
        }
        if (this.state.reloadRequired) {
            // eslint-disable-next-line no-alert
            if (confirm(this.props.intl.formatMessage(messages.confirmReload))) {
                this.isReloading = true;
                this.applyChangesThatNeedReload();
                return;
            }
        }
        this.props.onCloseSettingsModal();
    }
    handleHighQualityPenChange (e) {
        this.props.vm.renderer.setUseHighQualityRender(e.target.checked);
    }
    handleInterpolationChange (e) {
        this.props.vm.setInterpolation(e.target.checked);
    }
    handleInfiniteClonesChange (e) {
        this.props.vm.setRuntimeOptions({
            maxClones: e.target.checked ? Infinity : 300
        });
    }
    handleRemoveFencingChange (e) {
        this.props.vm.setRuntimeOptions({
            fencing: !e.target.checked
        });
    }
    handleRemoveLimitsChange (e) {
        this.props.vm.setRuntimeOptions({
            miscLimits: !e.target.checked
        });
    }
    handleWarpTimerChange (e) {
        this.props.vm.setCompilerOptions({
            warpTimer: e.target.checked
        });
    }
    handleDisableCompilerChange (e) {
        this.props.vm.setCompilerOptions({
            enabled: !e.target.checked
        });
    }
    handleStageWidthChange (value) {
        this.setState({
            stageWidth: value,
            reloadRequired: true
        });
    }
    handleStageHeightChange (value) {
        this.setState({
            stageHeight: value,
            reloadRequired: true
        });
    }
    applyChangesThatNeedReload () {
        const urlParams = new URLSearchParams(location.search);
        if (isDefaultStageSize(this.state.stageWidth, this.state.stageHeight)) {
            urlParams.delete('size');
        } else {
            urlParams.set('size', `${this.state.stageWidth}x${this.state.stageHeight}`);
        }
        const search = urlParams.toString();
        const newUrl = `${location.pathname}${search.length > 0 ? '?' : ''}${search}`;
        location.href = newUrl;
    }
    render () {
        const {
            /* eslint-disable no-unused-vars */
            onCloseSettingsModal,
            vm,
            /* eslint-enable no-unused-vars */
            ...props
        } = this.props;
        return (
            <SettingsModalComponent
                onClose={this.handleClose}
                reloadRequired={this.state.reloadRequired}
                onHighQualityPenChange={this.handleHighQualityPenChange}
                onInterpolationChange={this.handleInterpolationChange}
                onInfiniteClonesChange={this.handleInfiniteClonesChange}
                onRemoveFencingChange={this.handleRemoveFencingChange}
                onRemoveLimitsChange={this.handleRemoveLimitsChange}
                onWarpTimerChange={this.handleWarpTimerChange}
                onStageWidthChange={this.handleStageWidthChange}
                onStageHeightChange={this.handleStageHeightChange}
                onDisableCompilerChange={this.handleDisableCompilerChange}
                stageWidth={this.state.stageWidth}
                stageHeight={this.state.stageHeight}
                customStageSizeEnabled={this.state.stageWidth !== 480 || this.state.stageHeight !== 360}
                {...props}
            />
        );
    }
}

UsernameModal.propTypes = {
    intl: intlShape,
    onCloseSettingsModal: PropTypes.func,
    vm: PropTypes.shape({
        renderer: PropTypes.shape({
            setUseHighQualityRender: PropTypes.func
        }),
        setCompilerOptions: PropTypes.func,
        setInterpolation: PropTypes.func,
        setRuntimeOptions: PropTypes.func
    }),
    highQualityPen: PropTypes.bool,
    interpolation: PropTypes.bool,
    infiniteClones: PropTypes.bool,
    removeFencing: PropTypes.bool,
    removeLimits: PropTypes.bool,
    warpTimer: PropTypes.bool,
    disableCompiler: PropTypes.bool
};

const mapStateToProps = state => ({
    vm: state.scratchGui.vm,
    highQualityPen: state.scratchGui.tw.highQualityPen,
    interpolation: state.scratchGui.tw.interpolation,
    infiniteClones: state.scratchGui.tw.runtimeOptions.maxClones === Infinity,
    removeFencing: !state.scratchGui.tw.runtimeOptions.fencing,
    removeLimits: !state.scratchGui.tw.runtimeOptions.miscLimits,
    warpTimer: state.scratchGui.tw.compilerOptions.warpTimer,
    disableCompiler: !state.scratchGui.tw.compilerOptions.enabled
});

const mapDispatchToProps = dispatch => ({
    onCloseSettingsModal: () => dispatch(closeSettingsModal())
});

export default injectIntl(connect(
    mapStateToProps,
    mapDispatchToProps
)(UsernameModal));
