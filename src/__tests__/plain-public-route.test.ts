import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
    getOnlyConfiguredPublicJobField: vi.fn(),
    notFound: vi.fn(() => {
        throw new Error("not-found");
    }),
    redirect: vi.fn(() => {
        throw new Error("redirect");
    }),
}));

vi.mock("@/lib/public-route", () => ({
    getOnlyConfiguredPublicJobField: mocks.getOnlyConfiguredPublicJobField,
}));

vi.mock("next/navigation", () => ({
    notFound: mocks.notFound,
    redirect: mocks.redirect,
}));

import { redirectToOnlyPublicJobField } from "@/lib/plain-public-route";

describe("기본 공개 경로 이동", () => {
    it("직무 분야가 하나면 분야 URL로 이동", async () => {
        mocks.getOnlyConfiguredPublicJobField.mockResolvedValue({ id: "web" });

        await expect(redirectToOnlyPublicJobField("/resume")).rejects.toThrow(
            "redirect"
        );
        expect(mocks.redirect).toHaveBeenCalledWith("/web/resume");
    });

    it("직무 분야가 하나가 아니면 404", async () => {
        mocks.getOnlyConfiguredPublicJobField.mockResolvedValue(null);

        await expect(redirectToOnlyPublicJobField("")).rejects.toThrow(
            "not-found"
        );
        expect(mocks.notFound).toHaveBeenCalledOnce();
    });
});
