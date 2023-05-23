/* *********************************************************
 * Copyright 2021 eBay Inc.

 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
*********************************************************** */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @module NiceModal
 * */
import React, { useEffect, useCallback, useContext, useReducer } from 'react';
var symModalId = Symbol('NiceModalId');
var initialState = {};
var NiceModalContext = React.createContext(initialState);
var NiceModalIdContext = React.createContext(null);
var MODAL_REGISTRY = {};
var ALREADY_MOUNTED = {};
var uidSeed = 0;
var dispatch = function () {
    throw new Error('No dispatch method detected, did you embed your app with NiceModal.Provider?');
};
var getUid = function () { return "_nice_modal_" + uidSeed++; };
// Modal reducer used in useReducer hook.
export var reducer = function (state, action) {
    var _a, _b, _c;
    if (state === void 0) { state = initialState; }
    switch (action.type) {
        case 'nice-modal/show': {
            var _d = action.payload, modalId = _d.modalId, args = _d.args;
            return __assign(__assign({}, state), (_a = {}, _a[modalId] = __assign(__assign({}, state[modalId]), { id: modalId, args: args, 
                // If modal is not mounted, mount it first then make it visible.
                // There is logic inside HOC wrapper to make it visible after its first mount.
                // This mechanism ensures the entering transition.
                visible: !!ALREADY_MOUNTED[modalId], delayVisible: !ALREADY_MOUNTED[modalId] }), _a));
        }
        case 'nice-modal/hide': {
            var modalId = action.payload.modalId;
            if (!state[modalId])
                return state;
            return __assign(__assign({}, state), (_b = {}, _b[modalId] = __assign(__assign({}, state[modalId]), { visible: false }), _b));
        }
        case 'nice-modal/remove': {
            var modalId = action.payload.modalId;
            var newState = __assign({}, state);
            delete newState[modalId];
            return newState;
        }
        case 'nice-modal/set-flags': {
            var _e = action.payload, modalId = _e.modalId, flags = _e.flags;
            return __assign(__assign({}, state), (_c = {}, _c[modalId] = __assign(__assign({}, state[modalId]), flags), _c));
        }
        default:
            return state;
    }
};
// action creator to show a modal
function showModal(modalId, args) {
    return {
        type: 'nice-modal/show',
        payload: {
            modalId: modalId,
            args: args,
        },
    };
}
// action creator to set flags of a modal
function setModalFlags(modalId, flags) {
    return {
        type: 'nice-modal/set-flags',
        payload: {
            modalId: modalId,
            flags: flags,
        },
    };
}
// action creator to hide a modal
function hideModal(modalId) {
    return {
        type: 'nice-modal/hide',
        payload: {
            modalId: modalId,
        },
    };
}
// action creator to remove a modal
function removeModal(modalId) {
    return {
        type: 'nice-modal/remove',
        payload: {
            modalId: modalId,
        },
    };
}
var modalCallbacks = {};
var hideModalCallbacks = {};
var getModalId = function (modal) {
    if (typeof modal === 'string')
        return modal;
    if (!modal[symModalId]) {
        modal[symModalId] = getUid();
    }
    return modal[symModalId];
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function show(modal, args) {
    var modalId = getModalId(modal);
    if (typeof modal !== 'string' && !MODAL_REGISTRY[modalId]) {
        register(modalId, modal);
    }
    dispatch(showModal(modalId, args));
    if (!modalCallbacks[modalId]) {
        // `!` tell ts that theResolve will be written before it is used
        var theResolve_1;
        // `!` tell ts that theResolve will be written before it is used
        var theReject_1;
        var promise = new Promise(function (resolve, reject) {
            theResolve_1 = resolve;
            theReject_1 = reject;
        });
        modalCallbacks[modalId] = {
            resolve: theResolve_1,
            reject: theReject_1,
            promise: promise,
        };
    }
    return modalCallbacks[modalId].promise;
}
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function hide(modal) {
    var modalId = getModalId(modal);
    dispatch(hideModal(modalId));
    // Should also delete the callback for modal.resolve #35
    delete modalCallbacks[modalId];
    if (!hideModalCallbacks[modalId]) {
        // `!` tell ts that theResolve will be written before it is used
        var theResolve_2;
        // `!` tell ts that theResolve will be written before it is used
        var theReject_2;
        var promise = new Promise(function (resolve, reject) {
            theResolve_2 = resolve;
            theReject_2 = reject;
        });
        hideModalCallbacks[modalId] = {
            resolve: theResolve_2,
            reject: theReject_2,
            promise: promise,
        };
    }
    return hideModalCallbacks[modalId].promise;
}
export var remove = function (modalId) {
    dispatch(removeModal(modalId));
    delete modalCallbacks[modalId];
    delete hideModalCallbacks[modalId];
};
var setFlags = function (modalId, flags) {
    dispatch(setModalFlags(modalId, flags));
};
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useModal(modal, args) {
    var modals = useContext(NiceModalContext);
    var contextModalId = useContext(NiceModalIdContext);
    var modalId = null;
    var isUseComponent = modal && typeof modal !== 'string';
    if (!modal) {
        modalId = contextModalId;
    }
    else {
        modalId = getModalId(modal);
    }
    // Only if contextModalId doesn't exist
    if (!modalId)
        throw new Error('No modal id found in NiceModal.useModal.');
    var mid = modalId;
    // If use a component directly, register it.
    useEffect(function () {
        if (isUseComponent && !MODAL_REGISTRY[mid]) {
            register(mid, modal, args);
        }
    }, [isUseComponent, mid, modal, args]);
    var modalInfo = modals[mid];
    var showCallback = useCallback(function (args) { return show(mid, args); }, [mid]);
    var hideCallback = useCallback(function () { return hide(mid); }, [mid]);
    var removeCallback = useCallback(function () { return remove(mid); }, [mid]);
    var resolveCallback = useCallback(function (args) {
        var _a;
        (_a = modalCallbacks[mid]) === null || _a === void 0 ? void 0 : _a.resolve(args);
        delete modalCallbacks[mid];
    }, [mid]);
    var rejectCallback = useCallback(function (args) {
        var _a;
        (_a = modalCallbacks[mid]) === null || _a === void 0 ? void 0 : _a.reject(args);
        delete modalCallbacks[mid];
    }, [mid]);
    var resolveHide = useCallback(function (args) {
        var _a;
        (_a = hideModalCallbacks[mid]) === null || _a === void 0 ? void 0 : _a.resolve(args);
        delete hideModalCallbacks[mid];
    }, [mid]);
    return {
        id: mid,
        args: modalInfo === null || modalInfo === void 0 ? void 0 : modalInfo.args,
        visible: !!(modalInfo === null || modalInfo === void 0 ? void 0 : modalInfo.visible),
        keepMounted: !!(modalInfo === null || modalInfo === void 0 ? void 0 : modalInfo.keepMounted),
        show: showCallback,
        hide: hideCallback,
        remove: removeCallback,
        resolve: resolveCallback,
        reject: rejectCallback,
        resolveHide: resolveHide,
    };
}
export var create = function (Comp) {
    return function (_a) {
        var _b;
        var defaultVisible = _a.defaultVisible, keepMounted = _a.keepMounted, id = _a.id, props = __rest(_a, ["defaultVisible", "keepMounted", "id"]);
        var _c = useModal(id), args = _c.args, show = _c.show;
        // If there's modal state, then should mount it.
        var modals = useContext(NiceModalContext);
        var shouldMount = !!modals[id];
        useEffect(function () {
            // If defaultVisible, show it after mounted.
            if (defaultVisible) {
                show();
            }
            ALREADY_MOUNTED[id] = true;
            return function () {
                delete ALREADY_MOUNTED[id];
            };
        }, [id, show, defaultVisible]);
        useEffect(function () {
            if (keepMounted)
                setFlags(id, { keepMounted: true });
        }, [id, keepMounted]);
        var delayVisible = (_b = modals[id]) === null || _b === void 0 ? void 0 : _b.delayVisible;
        // If modal.show is called
        //  1. If modal was mounted, should make it visible directly
        //  2. If modal has not been mounted, should mount it first, then make it visible
        useEffect(function () {
            if (delayVisible) {
                // delayVisible: false => true, it means the modal.show() is called, should show it.
                show(args);
            }
        }, [delayVisible, args, show]);
        if (!shouldMount)
            return null;
        return (React.createElement(NiceModalIdContext.Provider, { value: id },
            React.createElement(Comp, __assign({}, props, args))));
    };
};
// All registered modals will be rendered in modal placeholder
export var register = function (id, comp, props) {
    if (!MODAL_REGISTRY[id]) {
        MODAL_REGISTRY[id] = { comp: comp, props: props };
    }
    else {
        MODAL_REGISTRY[id].props = props;
    }
};
/**
 * Unregister a modal.
 * @param id - The id of the modal.
 */
export var unregister = function (id) {
    delete MODAL_REGISTRY[id];
};
// The placeholder component is used to auto render modals when call modal.show()
// When modal.show() is called, it means there've been modal info
var NiceModalPlaceholder = function () {
    var modals = useContext(NiceModalContext);
    var visibleModalIds = Object.keys(modals).filter(function (id) { return !!modals[id]; });
    visibleModalIds.forEach(function (id) {
        if (!MODAL_REGISTRY[id] && !ALREADY_MOUNTED[id]) {
            console.warn("No modal found for id: " + id + ". Please check the id or if it is registered or declared via JSX.");
            return;
        }
    });
    var toRender = visibleModalIds
        .filter(function (id) { return MODAL_REGISTRY[id]; })
        .map(function (id) { return (__assign({ id: id }, MODAL_REGISTRY[id])); });
    return (React.createElement(React.Fragment, null, toRender.map(function (t) { return (React.createElement(t.comp, __assign({ key: t.id, id: t.id }, t.props))); })));
};
var InnerContextProvider = function (_a) {
    var children = _a.children;
    var _b = useReducer(reducer, initialState), modals = _b[0], givenDispatch = _b[1];
    useEffect(function () {
        var currentDispatch = dispatch;
        dispatch = givenDispatch;
        return function () {
            dispatch = currentDispatch;
        };
    }, [givenDispatch]);
    return (React.createElement(NiceModalContext.Provider, { value: modals },
        children,
        React.createElement(NiceModalPlaceholder, null)));
};
export var Provider = function (_a) {
    var children = _a.children, givenDispatch = _a.dispatch, givenModals = _a.modals;
    useEffect(function () {
        if (!givenDispatch)
            return;
        var currentDispatch = dispatch;
        dispatch = givenDispatch;
        return function () {
            dispatch = currentDispatch;
        };
    }, [givenDispatch]);
    if (!givenDispatch || !givenModals) {
        return React.createElement(InnerContextProvider, null, children);
    }
    return (React.createElement(NiceModalContext.Provider, { value: givenModals },
        children,
        React.createElement(NiceModalPlaceholder, null)));
};
/**
 * Declarative way to register a modal.
 * @param id - The id of the modal.
 * @param component - The modal Component.
 * @returns
 */
export var ModalDef = function (_a) {
    var id = _a.id, component = _a.component;
    useEffect(function () {
        register(id, component);
        return function () {
            unregister(id);
        };
    }, [id, component]);
    return null;
};
export var antdModal = function (modal) {
    return {
        visible: modal.visible,
        onOk: function () { return modal.hide(); },
        onCancel: function () { return modal.hide(); },
        afterClose: function () {
            // Need to resolve before remove
            modal.resolveHide();
            if (!modal.keepMounted)
                modal.remove();
        },
    };
};
export var antdModalV5 = function (modal) {
    var _a = antdModal(modal), onOk = _a.onOk, onCancel = _a.onCancel, afterClose = _a.afterClose;
    return {
        open: modal.visible,
        onOk: onOk,
        onCancel: onCancel,
        afterClose: afterClose,
    };
};
export var antdDrawer = function (modal) {
    return {
        visible: modal.visible,
        onClose: function () { return modal.hide(); },
        afterVisibleChange: function (v) {
            if (!v) {
                modal.resolveHide();
            }
            !v && !modal.keepMounted && modal.remove();
        },
    };
};
export var antdDrawerV5 = function (modal) {
    var _a = antdDrawer(modal), onClose = _a.onClose, afterOpenChange = _a.afterVisibleChange;
    return {
        open: modal.visible,
        onClose: onClose,
        afterOpenChange: afterOpenChange,
    };
};
export var muiDialog = function (modal) {
    return {
        open: modal.visible,
        onClose: function () { return modal.hide(); },
        onExited: function () {
            modal.resolveHide();
            !modal.keepMounted && modal.remove();
        },
    };
};
export var muiDialogV5 = function (modal) {
    return {
        open: modal.visible,
        onClose: function () { return modal.hide(); },
        TransitionProps: {
            onExited: function () {
                modal.resolveHide();
                !modal.keepMounted && modal.remove();
            },
        },
    };
};
export var bootstrapDialog = function (modal) {
    return {
        show: modal.visible,
        onHide: function () { return modal.hide(); },
        onExited: function () {
            modal.resolveHide();
            !modal.keepMounted && modal.remove();
        },
    };
};
var NiceModal = {
    Provider: Provider,
    ModalDef: ModalDef,
    NiceModalContext: NiceModalContext,
    create: create,
    register: register,
    show: show,
    hide: hide,
    remove: remove,
    useModal: useModal,
    reducer: reducer,
    antdModal: antdModal,
    antdDrawer: antdDrawer,
    muiDialog: muiDialog,
    bootstrapDialog: bootstrapDialog,
};
export default NiceModal;
//# sourceMappingURL=index.js.map