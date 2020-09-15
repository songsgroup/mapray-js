const RenderPhase = {
    NORMAL: {
        id: "NORMAL",
        flag: 1,
    },
    OVERLAY: {
        id: "OVERLAY",
        flag: 2,
    },
    NORMAL_AND_OVERLAY: {
        id: "NORMAL_AND_OVERLAY",
        flag: 3,
    }
};

RenderPhase.values = [
    RenderPhase.NORMAL,
    RenderPhase.OVERLAY,
];


export default RenderPhase;
