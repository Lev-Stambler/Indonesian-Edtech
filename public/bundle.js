
(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }

    function bind(component, name, callback) {
        if (component.$$.props.indexOf(name) === -1)
            return;
        component.$$.bound[name] = callback;
        callback(component.$$.ctx[name]);
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, value) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* src/components/players/MainPlayer.svelte generated by Svelte v3.6.9 */

    const file = "src/components/players/MainPlayer.svelte";

    function create_fragment(ctx) {
    	var h1, t1, t2;

    	return {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "asasas";
    			t1 = space();
    			t2 = text(ctx.charName);
    			add_location(h1, file, 3, 0, 57);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, h1, anchor);
    			insert(target, t1, anchor);
    			insert(target, t2, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(h1);
    				detach(t1);
    				detach(t2);
    			}
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	const charName = "Jimbolaya";

    	return { charName };
    }

    class MainPlayer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["charName"]);
    	}

    	get charName() {
    		return this.$$.ctx.charName;
    	}

    	set charName(value) {
    		throw new Error("<MainPlayer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/speech/Speechbox.svelte generated by Svelte v3.6.9 */

    const file$1 = "src/components/speech/Speechbox.svelte";

    function create_fragment$1(ctx) {
    	var div1, div0, t0, t1, p, t2;

    	return {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(ctx.speaker);
    			t1 = space();
    			p = element("p");
    			t2 = text(ctx.text);
    			attr(div0, "class", "speaker svelte-1rsb9rv");
    			add_location(div0, file$1, 23, 2, 334);
    			attr(p, "class", "svelte-1rsb9rv");
    			add_location(p, file$1, 24, 2, 373);
    			attr(div1, "class", "box svelte-1rsb9rv");
    			add_location(div1, file$1, 22, 0, 314);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, t0);
    			append(div1, t1);
    			append(div1, p);
    			append(p, t2);
    		},

    		p: function update(changed, ctx) {
    			if (changed.speaker) {
    				set_data(t0, ctx.speaker);
    			}

    			if (changed.text) {
    				set_data(t2, ctx.text);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach(div1);
    			}
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { text, speaker } = $$props;

    	const writable_props = ['text', 'speaker'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Speechbox> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('text' in $$props) $$invalidate('text', text = $$props.text);
    		if ('speaker' in $$props) $$invalidate('speaker', speaker = $$props.speaker);
    	};

    	return { text, speaker };
    }

    class Speechbox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["text", "speaker"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.text === undefined && !('text' in props)) {
    			console.warn("<Speechbox> was created without expected prop 'text'");
    		}
    		if (ctx.speaker === undefined && !('speaker' in props)) {
    			console.warn("<Speechbox> was created without expected prop 'speaker'");
    		}
    	}

    	get text() {
    		throw new Error("<Speechbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<Speechbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get speaker() {
    		throw new Error("<Speechbox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set speaker(value) {
    		throw new Error("<Speechbox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/templates/PersonLeft.svelte generated by Svelte v3.6.9 */

    const file$2 = "src/templates/PersonLeft.svelte";

    function create_fragment$2(ctx) {
    	var updating_charName, t0, t1, t2, t3, t4, div0, t5, div1, current;

    	function character0_charName_binding(value) {
    		ctx.character0_charName_binding.call(null, value);
    		updating_charName = true;
    		add_flush_callback(() => updating_charName = false);
    	}

    	let character0_props = {};
    	if (ctx.charName !== void 0) {
    		character0_props.charName = ctx.charName;
    	}
    	var character0 = new ctx.Character({ props: character0_props, $$inline: true });

    	binding_callbacks.push(() => bind(character0, 'charName', character0_charName_binding));

    	var character1 = new ctx.Character({ $$inline: true });

    	var speechbox = new Speechbox({
    		props: { speaker: ctx.charName, text: ctx.text },
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			character0.$$.fragment.c();
    			t0 = space();
    			t1 = text(ctx.text);
    			t2 = space();
    			t3 = text(ctx.charName);
    			t4 = space();
    			div0 = element("div");
    			character1.$$.fragment.c();
    			t5 = space();
    			div1 = element("div");
    			speechbox.$$.fragment.c();
    			attr(div0, "class", "charactercontainer");
    			add_location(div0, file$2, 19, 0, 330);
    			attr(div1, "class", "speechcontainer svelte-rcoszw");
    			add_location(div1, file$2, 22, 0, 386);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(character0, target, anchor);
    			insert(target, t0, anchor);
    			insert(target, t1, anchor);
    			insert(target, t2, anchor);
    			insert(target, t3, anchor);
    			insert(target, t4, anchor);
    			insert(target, div0, anchor);
    			mount_component(character1, div0, null);
    			insert(target, t5, anchor);
    			insert(target, div1, anchor);
    			mount_component(speechbox, div1, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var character0_changes = {};
    			if (!updating_charName && changed.charName) {
    				character0_changes.charName = ctx.charName;
    			}
    			character0.$set(character0_changes);

    			if (!current || changed.text) {
    				set_data(t1, ctx.text);
    			}

    			if (!current || changed.charName) {
    				set_data(t3, ctx.charName);
    			}

    			var speechbox_changes = {};
    			if (changed.charName) speechbox_changes.speaker = ctx.charName;
    			if (changed.text) speechbox_changes.text = ctx.text;
    			speechbox.$set(speechbox_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(character0.$$.fragment, local);

    			transition_in(character1.$$.fragment, local);

    			transition_in(speechbox.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(character0.$$.fragment, local);
    			transition_out(character1.$$.fragment, local);
    			transition_out(speechbox.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(character0, detaching);

    			if (detaching) {
    				detach(t0);
    				detach(t1);
    				detach(t2);
    				detach(t3);
    				detach(t4);
    				detach(div0);
    			}

    			destroy_component(character1);

    			if (detaching) {
    				detach(t5);
    				detach(div1);
    			}

    			destroy_component(speechbox);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { text, Character, charName } = $$props;

    	const writable_props = ['text', 'Character', 'charName'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<PersonLeft> was created with unknown prop '${key}'`);
    	});

    	function character0_charName_binding(value) {
    		charName = value;
    		$$invalidate('charName', charName);
    	}

    	$$self.$set = $$props => {
    		if ('text' in $$props) $$invalidate('text', text = $$props.text);
    		if ('Character' in $$props) $$invalidate('Character', Character = $$props.Character);
    		if ('charName' in $$props) $$invalidate('charName', charName = $$props.charName);
    	};

    	return {
    		text,
    		Character,
    		charName,
    		character0_charName_binding
    	};
    }

    class PersonLeft extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["text", "Character", "charName"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.text === undefined && !('text' in props)) {
    			console.warn("<PersonLeft> was created without expected prop 'text'");
    		}
    		if (ctx.Character === undefined && !('Character' in props)) {
    			console.warn("<PersonLeft> was created without expected prop 'Character'");
    		}
    		if (ctx.charName === undefined && !('charName' in props)) {
    			console.warn("<PersonLeft> was created without expected prop 'charName'");
    		}
    	}

    	get text() {
    		throw new Error("<PersonLeft>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<PersonLeft>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Character() {
    		throw new Error("<PersonLeft>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Character(value) {
    		throw new Error("<PersonLeft>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get charName() {
    		throw new Error("<PersonLeft>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set charName(value) {
    		throw new Error("<PersonLeft>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/templates/CodeRender.svelte generated by Svelte v3.6.9 */

    function create_fragment$3(ctx) {
    	return {
    		c: noop,

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    }

    class CodeRender extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$3, safe_not_equal, []);
    	}
    }

    console.log(PersonLeft);

    var levelOne = [
      {
        template: PersonLeft,
        opts: { 
          text: "asasdj djshdjs hdjsh d",
          Character: MainPlayer,
        }
      },
      {
        template: CodeRender
      }
    ];

    var levels = [
      levelOne
    ];

    /* src/App.svelte generated by Svelte v3.6.9 */

    function create_fragment$4(ctx) {
    	var current;

    	var currentcomponent_spread_levels = [
    		ctx.CurrentScreen.opts
    	];

    	let currentcomponent_props = {};
    	for (var i = 0; i < currentcomponent_spread_levels.length; i += 1) {
    		currentcomponent_props = assign(currentcomponent_props, currentcomponent_spread_levels[i]);
    	}
    	var currentcomponent = new ctx.CurrentComponent({
    		props: currentcomponent_props,
    		$$inline: true
    	});

    	return {
    		c: function create() {
    			currentcomponent.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(currentcomponent, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var currentcomponent_changes = changed.CurrentScreen ? get_spread_update(currentcomponent_spread_levels, [
    				ctx.CurrentScreen.opts
    			]) : {};
    			currentcomponent.$set(currentcomponent_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(currentcomponent.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(currentcomponent.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(currentcomponent, detaching);
    		}
    	};
    }

    let currentLevel = 0;

    let currentSublevel = 0;

    function instance$3($$self, $$props, $$invalidate) {
    	let { name } = $$props;
    	let CurrentScreen = levels[currentLevel][currentSublevel];
    	let CurrentComponent = levels[currentLevel][currentSublevel].template;

    	const writable_props = ['name'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('name' in $$props) $$invalidate('name', name = $$props.name);
    	};

    	return { name, CurrentScreen, CurrentComponent };
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$4, safe_not_equal, ["name"]);

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.name === undefined && !('name' in props)) {
    			console.warn("<App> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
