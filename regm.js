var RegM = {
    stepCount : 0,
    b : [],
    c : {}, // [B, c0, c1, ...]
    running : true,
    instructions : {
        load : function(i) {
            RegM.c[1] = RegM.getC(i);
        },
        cload : function(i) {
            RegM.c[1] = parseInt(i);
        },
        store : function(i) {
            RegM.setC(i, RegM.c[1]);
        },
        add : function(i) {
            RegM.c[1] += RegM.getC(i);
        },
        cadd : function(i) {
            RegM.c[1] += parseInt(i);
        },
        sub : function(i) {
            RegM.c[1] -= RegM.getC(i);
        },
        csub : function(i) {
            RegM.c[1] -= parseInt(i);
        },
        mult : function(i) {
            RegM.c[1] *= RegM.getC(i);
        },
        cmult : function(i) {
            RegM.c[1] *= parseInt(i);
        },
        div : function(i) {
            RegM.c[1] = Math.floor(RegM.c[1] / RegM.getC(i));
        },
        cdiv : function(i) {
            RegM.c[1] = Math.floor(RegM.c[1] / parseInt(i));
        },
        goto : function(i) {
            RegM.c[0] = parseInt(i);
        },
        if : function(c, op, val, goto, i) {
            var jump = false;
            if ((op == '=' || op == '==') && RegM.c[1] == parseInt(val)) {
                jump = true;
            } else if ((op == '!=' || op == '<>') && RegM.c[1] != parseInt(val)) {
                jump = true;
            } else if (op == '>' && RegM.c[1] > parseInt(val)) {
                jump = true;
            } else if (op == '>=' && RegM.c[1] >= parseInt(val)) {
                jump = true;
            } else if (op == '<' && RegM.c[1] < parseInt(val)) {
                jump = true;
            } else if (op == '<=' && RegM.c[1] <= parseInt(val)) {
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
    getC : function(index) {
        return RegM.c[parseInt(index) + 1];
    },
    setC : function(index, value) {
        RegM.c[parseInt(index) + 1] = value;
    },
    run : function(code, memory, callback) {
        if (callback) {
            RegM.log = callback;
        }
        
        RegM.stepCount = 0;
        RegM.b = code.match(/[^\r\n]+/g);
        RegM.c = [];
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
        
        for (var i = 0; i < RegM.c.length; i++) {
            RegM.c[i] = parseInt(c[i]) | 0;
        }
        
        if (RegM.c[0] == 0) {
            RegM.c[0] = 1;
        }
        
        RegM.log({
            type : 'step',
            step : RegM.stepCount,
            line : '',
            instruction : '',
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
            
            for (var i = 0; i < RegM.c.length; i++) {
                if (RegM.c[i] < 0) { 
                    RegM.c[i] = 0;
                }
            }
            
            RegM.stepCount++;
            RegM.log({
                type : 'step',
                step : RegM.stepCount,
                line : line,
                instruction : instruction,
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