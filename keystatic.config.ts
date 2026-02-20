// Keystatic CMS 설정
//
// Collection(컬렉션): 같은 스키마의 항목을 여러 개 두는 곳입니다.
// - 블로그 포스트, 태그, 작성자 등 "여러 개"가 필요한 타입마다 컬렉션을 하나씩 정의합니다.
// - collections 아래에 키를 추가하고 collection({ label, path, schema, ... }) 로 정의하면
//   Admin UI에 새 메뉴가 생깁니다.
// - 예: testimonials: collection({ label: 'Testimonials', path: '...', schema: { ... } }),
//
import { config, fields, collection } from "@keystatic/core";

export default config({
    storage: {
        kind: "local",
    },
    collections: {
        // 블로그 포스트 컬렉션
        posts: collection({
            label: "블로그 포스트",
            slugField: "title",
            path: "src/content/posts/*",
            format: { contentField: "content" },
            columns: ["pubDate", "category", "description"],
            schema: {
                title: fields.slug({
                    name: {
                        label: "제목",
                    },
                }),
                description: fields.text({
                    label: "요약",
                    multiline: true,
                }),
                pubDate: fields.datetime({
                    label: "발행일·시간",
                    description:
                        "KST(한국 표준시) 기준입니다. 날짜와 시간을 설정하세요.",
                    defaultValue: { kind: "now" },
                }),
                category: fields.text({
                    label: "카테고리",
                    description: "예: UnrealEngine, Unity, Console",
                }),
                tags: fields.array(
                    fields.relationship({
                        label: "태그",
                        collection: "tags",
                        description:
                            "드롭다운에서만 선택하세요. 직접 입력하면 null로 저장됩니다. 새 태그는 먼저 좌측 '태그' 컬렉션에서 추가한 뒤 여기서 선택하세요.",
                    }),
                    {
                        label: "태그 목록",
                        itemLabel: (props) => props.value ?? "태그 선택",
                    }
                ),
                thumbnail: fields.image({
                    label: "썸네일",
                    description: "비워두면 본문 첫 이미지를 사용합니다.",
                    directory: "public/images/posts",
                    publicPath: "/images/posts/",
                }),
                content: fields.markdoc({
                    label: "본문",
                    options: {
                        // 에디터에서 추가/붙여넣기한 이미지를 로컬 디렉터리로 복사
                        image: {
                            directory: "public/images/posts",
                            publicPath: "/images/posts/",
                        },
                    },
                }),
            },
        }),
        // 태그 컬렉션: 포스트에서 선택하는 태그 목록 (중복/대소문자 통일)
        tags: collection({
            label: "태그",
            slugField: "name",
            path: "src/content/tags/*",
            schema: {
                name: fields.slug({
                    name: {
                        label: "태그 이름",
                        description: "표시 이름 (예: Blueprint, C++)",
                    },
                }),
                color: fields.text({
                    label: "색상",
                    description:
                        "블로그 미리보기에서 태그 뱃지 색상. 예: #3b82f6, #22c55e, rgb(59, 130, 246). 비워두면 기본 스타일.",
                }),
            },
        }),
    },
});
