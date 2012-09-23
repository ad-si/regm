var RegM = {
    stepCount : 0,
    b : [],
    c : {},
    C : 0,
    running : true,
    instructions : {
        load : function(i) {
            RegM.C = RegM.c[parseInt(i)];
        },
        cload : function(i) {
            RegM.C = parseInt(i);
        },
        store : function(i) {
            RegM.c[parseInt(i)] = RegM.C;
        },
        add : function(i) {
            RegM.C += RegM.c[parseInt(i)];
        },
        cadd : function(i) {
            RegM.C += parseInt(i);
        },
        sub : function(i) {
            RegM.C -= RegM.c[parseInt(i)];
        },
        csub : function(i) {
            RegM.C -= parseInt(i);
        },
        mult : function(i) {
            RegM.C *= RegM.c[parseInt(i)];
        },
        cmult : function(i) {
            RegM.C *= parseInt(i);
        },
        div : function(i) {
            RegM.C = Math.floor(RegM.C / RegM.c[parseInt(i)]);
        },
        cdiv : function(i) {
            RegM.C = Math.floor(RegM.C / parseInt(i));
        },
        goto : function(i) {
            RegM.c[0] = parseInt(i);
        },
        if : function(c, op, val, goto, i) {
            var jump = false;
            if ((op == '=' || op == '==') && RegM.C == parseInt(val)) {
                jump = true;
            } else if ((op == '!=' || op == '<>') && RegM.C != parseInt(val)) {
                jump = true;
            } else if (op == '>' && RegM.C > parseInt(val)) {
                jump = true;
            } else if (op == '>=' && RegM.C >= parseInt(val)) {
                jump = true;
            } else if (op == '<' && RegM.C < parseInt(val)) {
                jump = true;
            } else if (op == '<=' && RegM.C <= parseInt(val)) {
                jump = true;
            }
            
            if (jump) {
                RegM.instructions.goto(i);
            }
        },
        end : function() {
            RegM.c[0]--;
            RegM.running = false;
        }
    },
    run : function(code, memory, callback) {
        if (callback) {
            RegM.log = callback;
        }
        
        RegM.stepCount = 0;
        RegM.b = code.match(/[^\r\n]+/g);
        RegM.c = [];
        RegM.C = 0;
        RegM.running = true;
        
        if (!RegM.b) {
            RegM.log({
                type : 'error',
                message : 'No program given!'
            });
            return;
        }
        
        // init memory
        var c = memory.split(/[\s,;]+/);
        RegM.c.length = c.length < 16 ? 16 : c.length + 1;
        RegM.c[0] = 1;
        
        for (var i = 1; i < RegM.c.length; i++) {
            RegM.c[i] = parseInt(c[i - 1]) | 0;
        }
        
        RegM.log({
            type : 'step',
            step : RegM.stepCount,
            line : '',
            instruction : '',
            akku : 0,
            c: RegM.c
        });
        
        while (RegM.running) {
            RegM.step();
            
            if (RegM.stepCount >= 1000) {
                RegM.running = false;
                RegM.log({
                    type : 'error',
                    message : 'Limit of 1000 steps reached!'
                });
            }
        }
    },
    step : function() {
        if (RegM.c[0] > RegM.b.length) {
            RegM.running = false;
            RegM.log({
                type : 'error',
                message : 'Invalid program counter!'
            });
            return;
        }
        
        var line = RegM.c[0];
        var instruction = RegM.b[line - 1];
        var parts = instruction.split(' ');
        var name = parts[0].toLowerCase();
        
        if (RegM.instructions[name]) {
            RegM.c[0]++;
            RegM.instructions[name].apply(RegM, parts.slice(1));
            
            RegM.stepCount++;
            RegM.log({
                type : 'step',
                step : RegM.stepCount,
                line : line,
                instruction : instruction,
                akku : RegM.C,
                c: RegM.c
            });
        } else {
            RegM.running = false;
            RegM.log({
                type : 'error',
                message : 'Invalid instruction: ' + instruction
            });
        }
    },
    log : function(object) {
        console.log(JSON.stringify(object));
    }
};