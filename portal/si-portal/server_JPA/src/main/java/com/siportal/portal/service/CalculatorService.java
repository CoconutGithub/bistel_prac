package com.siportal.portal.service;

import net.objecthunter.exp4j.Expression;
import net.objecthunter.exp4j.ExpressionBuilder;
import net.objecthunter.exp4j.function.Function; // Function 클래스 import 필요
import org.springframework.stereotype.Service;

@Service
public class CalculatorService {

    public Double calculate(String expressionString) {
        try {
            ExpressionBuilder builder = new ExpressionBuilder(expressionString);

            builder.function(new Function("Rnd", 1) {
                @Override
                public double apply(double... args) {
                    return (double) Math.round(args[0]);
                }
            });

            Expression expression = builder.build();
            return expression.evaluate();

        } catch (ArithmeticException e) {
            throw new IllegalArgumentException("Math error: " + e.getMessage());
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid expression: " + e.getMessage());
        }
    }
}