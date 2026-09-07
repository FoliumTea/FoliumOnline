import { describe, expect, it } from "vitest";
import { getOnlyPublicJobField } from "@/lib/public-route";

describe("기본 공개 경로의 단일 직무 분야 판별", () => {
    it("등록 직무 분야가 하나일 때만 이동 대상을 반환", () => {
        const field = {
            id: "web",
            name: "Web",
            emoji: "🖥️",
            headerTitle: "Web Developer",
        };
        expect(getOnlyPublicJobField([field])).toEqual(field);
    });

    it("직무 분야가 없거나 여러 개면 기본 경로 이동 대상 없음", () => {
        expect(getOnlyPublicJobField([])).toBeNull();
        expect(
            getOnlyPublicJobField([
                { id: "web", name: "Web", emoji: "🖥️" },
                { id: "game", name: "Game", emoji: "🎮" },
            ])
        ).toBeNull();
    });
});
