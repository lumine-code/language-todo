describe("TODO injection service", () => {
  beforeEach(async () => {
    await lumine.packages.activatePackage("language-todo");
  });

  it("returns one disposable that owns every registered node type", () => {
    const registrations = [];
    spyOn(lumine.grammars, "addInjectionPoint").and.callFake(() => {
      const registration = { dispose: jasmine.createSpy("dispose") };
      registrations.push(registration);
      return registration;
    });

    const service = lumine.packages
      .getActivePackage("language-todo")
      .mainModule.provideTodoInjection();
    const disposable = service.addInjectionPoint("source.test", {
      types: ["comment", "string"],
    });

    expect(registrations.length).toBe(2);
    disposable.dispose();
    expect(registrations[0].dispose).toHaveBeenCalled();
    expect(registrations[1].dispose).toHaveBeenCalled();
  });
});
