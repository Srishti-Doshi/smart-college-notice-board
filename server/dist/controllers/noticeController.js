"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotice = exports.updateNotice = exports.createNotice = exports.getArchivedNotices = exports.getActiveNotices = void 0;
const Notice_1 = require("../models/Notice");
const cloudinaryUpload_1 = require("../services/cloudinaryUpload");
const notice_1 = require("../types/notice");
const isCategory = (value) => notice_1.NOTICE_CATEGORIES.includes(value);
const isUrgency = (value) => notice_1.NOTICE_URGENCIES.includes(value);
const now = () => new Date();
const parseDate = (value) => {
    if (!value) {
        return undefined;
    }
    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};
const parseBoolean = (value) => {
    if (typeof value === "boolean") {
        return value;
    }
    if (typeof value === "string") {
        return value === "true";
    }
    return Boolean(value);
};
const parsePinnedRank = (value) => {
    if (typeof value === "number") {
        return value;
    }
    if (typeof value === "string" && value.trim() !== "") {
        return Number(value);
    }
    return undefined;
};
const normalizePayload = (body, options = {}) => {
    const isPartial = options.partial ?? false;
    const normalizedData = {};
    if (!isPartial || body.title !== undefined) {
        const title = body.title?.trim();
        if (!title) {
            return { error: "Title is required." };
        }
        normalizedData.title = title;
    }
    if (!isPartial || body.description !== undefined) {
        const description = body.description?.trim();
        if (!description) {
            return { error: "Description is required." };
        }
        normalizedData.description = description;
    }
    if (!isPartial || body.category !== undefined) {
        if (!body.category || !isCategory(body.category)) {
            return { error: `Category must be one of: ${notice_1.NOTICE_CATEGORIES.join(", ")}.` };
        }
        normalizedData.category = body.category;
    }
    if (!isPartial || body.urgency !== undefined) {
        const urgency = body.urgency ?? "Medium";
        if (!isUrgency(urgency)) {
            return { error: `Urgency must be one of: ${notice_1.NOTICE_URGENCIES.join(", ")}.` };
        }
        normalizedData.urgency = urgency;
    }
    if (!isPartial || body.department !== undefined) {
        normalizedData.department = body.department?.trim() || "All";
    }
    if (body.attachmentUrl !== undefined) {
        normalizedData.attachmentUrl = body.attachmentUrl?.trim();
    }
    if (body.attachmentType !== undefined) {
        normalizedData.attachmentType = body.attachmentType?.trim();
    }
    if (body.createdBy !== undefined) {
        normalizedData.createdBy = body.createdBy?.trim();
    }
    if (body.expiresAt !== undefined) {
        const expiresAt = parseDate(body.expiresAt);
        if (expiresAt === null) {
            return { error: "Expiry date is invalid." };
        }
        normalizedData.expiresAt = expiresAt;
    }
    if (body.isArchived !== undefined) {
        normalizedData.isArchived = parseBoolean(body.isArchived);
    }
    if (body.isPinned !== undefined || body.pinnedRank !== undefined || !isPartial) {
        const isPinned = body.isPinned === undefined ? false : parseBoolean(body.isPinned);
        if (isPinned) {
            const pinnedRank = parsePinnedRank(body.pinnedRank);
            if (pinnedRank === undefined || ![1, 2, 3].includes(pinnedRank)) {
                return { error: "Pinned rank must be 1, 2, or 3." };
            }
            normalizedData.isPinned = true;
            normalizedData.pinnedRank = pinnedRank;
        }
        else if (body.isPinned !== undefined || !isPartial) {
            normalizedData.isPinned = false;
            normalizedData.pinnedRank = undefined;
        }
    }
    return { value: normalizedData };
};
const enrichPayloadWithAttachment = (payload, attachment) => {
    if (!attachment) {
        return payload;
    }
    return {
        ...payload,
        attachmentUrl: attachment.attachmentUrl,
        attachmentName: attachment.attachmentName,
        attachmentType: attachment.attachmentType,
    };
};
const uploadAttachmentIfPresent = async (payload, request) => {
    if (!request.file) {
        return payload;
    }
    const uploadedAttachment = await (0, cloudinaryUpload_1.uploadBufferToCloudinary)(request.file);
    return enrichPayloadWithAttachment(payload, {
        attachmentUrl: uploadedAttachment.attachmentUrl,
        attachmentName: request.file.originalname,
        attachmentType: uploadedAttachment.attachmentType,
    });
};
const buildNoticeQuery = (query, archived) => {
    const currentTime = now();
    const search = typeof query.search === "string" ? query.search.trim() : "";
    const category = typeof query.category === "string" ? query.category.trim() : "";
    const urgency = typeof query.urgency === "string" ? query.urgency.trim() : "";
    const department = typeof query.department === "string" ? query.department.trim() : "";
    const dateFilter = typeof query.date === "string" ? query.date.trim() : "";
    const timezoneOffsetMinutesRaw = typeof query.tzOffset === "string" ? Number(query.tzOffset) : NaN;
    const timezoneOffsetMinutes = Number.isNaN(timezoneOffsetMinutesRaw)
        ? 0
        : timezoneOffsetMinutesRaw;
    const filters = archived
        ? {
            $or: [{ isArchived: true }, { expiresAt: { $lt: currentTime } }],
        }
        : {
            isArchived: false,
            $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gte: currentTime } }],
        };
    if (category && isCategory(category)) {
        filters.category = category;
    }
    if (urgency && isUrgency(urgency)) {
        filters.urgency = urgency;
    }
    if (department) {
        filters.department = new RegExp(`^${department}$`, "i");
    }
    if (dateFilter) {
        const matchedDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateFilter);
        if (matchedDate) {
            const year = Number(matchedDate[1]);
            const monthIndex = Number(matchedDate[2]) - 1;
            const day = Number(matchedDate[3]);
            const localMidnightUtcMs = Date.UTC(year, monthIndex, day, 0, 0, 0, 0) +
                timezoneOffsetMinutes * 60 * 1000;
            const nextLocalMidnightUtcMs = localMidnightUtcMs + 24 * 60 * 60 * 1000;
            filters.createdAt = {
                $gte: new Date(localMidnightUtcMs),
                $lt: new Date(nextLocalMidnightUtcMs),
            };
        }
    }
    if (search) {
        const existingAndFilters = Array.isArray(filters.$and) ? filters.$and : [];
        filters.$and = [
            ...existingAndFilters,
            {
                $or: [
                    { title: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } },
                    { department: { $regex: search, $options: "i" } },
                ],
            },
        ];
    }
    return filters;
};
const activeNoticeSort = { isPinned: -1, pinnedRank: 1, createdAt: -1 };
const archivedNoticeSort = { expiresAt: -1, createdAt: -1 };
const getActiveNotices = async (req, res) => {
    try {
        const notices = await Notice_1.Notice.find(buildNoticeQuery(req.query, false)).sort(activeNoticeSort);
        res.json(notices);
    }
    catch (error) {
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to fetch notices.",
        });
    }
};
exports.getActiveNotices = getActiveNotices;
const getArchivedNotices = async (req, res) => {
    try {
        const notices = await Notice_1.Notice.find(buildNoticeQuery(req.query, true)).sort(archivedNoticeSort);
        res.json(notices);
    }
    catch (error) {
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to fetch archive.",
        });
    }
};
exports.getArchivedNotices = getArchivedNotices;
const createNotice = async (req, res) => {
    try {
        const payloadWithAttachment = await uploadAttachmentIfPresent(req.body, req);
        const parsed = normalizePayload(payloadWithAttachment);
        if ("error" in parsed) {
            return res.status(400).json(parsed);
        }
        const notice = await Notice_1.Notice.create(parsed.value);
        return res.status(201).json(notice);
    }
    catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to create notice.",
        });
    }
};
exports.createNotice = createNotice;
const updateNotice = async (req, res) => {
    try {
        const payloadWithAttachment = await uploadAttachmentIfPresent(req.body, req);
        const parsed = normalizePayload(payloadWithAttachment, {
            partial: true,
        });
        if ("error" in parsed) {
            return res.status(400).json(parsed);
        }
        const updatedNotice = await Notice_1.Notice.findByIdAndUpdate(req.params.id, parsed.value, {
            new: true,
            runValidators: true,
        });
        if (!updatedNotice) {
            return res.status(404).json({ error: "Notice not found." });
        }
        return res.json(updatedNotice);
    }
    catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to update notice.",
        });
    }
};
exports.updateNotice = updateNotice;
const deleteNotice = async (req, res) => {
    try {
        const deletedNotice = await Notice_1.Notice.findByIdAndDelete(req.params.id);
        if (!deletedNotice) {
            return res.status(404).json({ error: "Notice not found." });
        }
        return res.status(204).send();
    }
    catch (error) {
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to delete notice.",
        });
    }
};
exports.deleteNotice = deleteNotice;
