YUI.add("yuidoc-meta", function(Y) {
   Y.YUIDoc = { meta: {
    "classes": [
        "CallbacksHandler",
        "CallbacksInvoker",
        "Color",
        "Component",
        "FObject",
        "Fire",
        "Fire.Scene",
        "Fire._DeserializeInfo",
        "HashObject",
        "Intersection",
        "Math",
        "Matrix23",
        "Path",
        "Rect",
        "Time",
        "Transform",
        "Vec2"
    ],
    "modules": [
        "Fire",
        "Reserved-Words"
    ],
    "allModules": [
        {
            "displayName": "Fire",
            "name": "Fire"
        },
        {
            "displayName": "Reserved-Words",
            "name": "Reserved-Words",
            "description": "!#en\n\n!#zh 除了类已经定义的变量外，以下是其它 Fireball-x 中已经使用的变量名，请避免冲突。这些变量有一些是保留用途，只有特殊情况才会声明。\n### 全局变量\n- `Fire`\n- `PIXI`\n- `require`\n### 可能定义在任意对象上的变量\n\n- `__id__`\n- `__type__`\n- `_iN$t`\n- `_rawext`\n\n### 可能定义在任意类型或 prototype 上的变量\n\n- 任何以 `_attrs$` 开头的变量\n- `__classname__`\n- `__cid__`\n\n### FireClass 上的静态变量\n\n- `get`\n- `set`\n- `getset`\n- `prop`\n- `$super`\n- `__props__`\n\n### FireClass 上的成员变量\n\n- `_observing`\n- `_$erialized`"
        }
    ]
} };
});