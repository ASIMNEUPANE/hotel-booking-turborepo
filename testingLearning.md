just example : But, as you can see, our UserService functions are dependent on the PrismaService. We need to isolate the functions from PrismaService,why ?

1.By isolating the function from its dependencies, we can focus solely on the logic of our function.

2.Our test can be designed more efficiently because we don’t have to deal with the complexity of external dependency, especially in Test Driven Development.

3.Introduces more control to our input and output prediction/assertion. Our test environment will be more stable and reproducible.

urls:[https://medium.com/@bonaventuragal/nestjs-testing-recipe-mocking-prisma-274c212d4b80]

,
"test": {
"dependsOn": ["^test"],
"inputs": ["$TURBO_DEFAULT$", ".env*"],
"outputs": []
}
