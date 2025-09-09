package com.vision.app.controller;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/simple")
public class SimpleTestController {

    @GetMapping("/ping")
    public Map<String, Object> ping() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "pong");
        response.put("timestamp", System.currentTimeMillis());
        response.put("status", "OK");
        return response;
    }

    @PostMapping("/echo")
    public Map<String, Object> echo(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        response.put("echo", request);
        response.put("timestamp", System.currentTimeMillis());
        response.put("received", true);
        return response;
    }

    @PostMapping("/login-test")
    public Map<String, Object> loginTest(@RequestBody Map<String, Object> credentials) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Login test endpoint working");
        response.put("receivedUsername", credentials.get("username"));
        response.put("hasPassword", credentials.containsKey("password"));
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }
}



