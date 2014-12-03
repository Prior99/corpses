describe('Test for sanity of testframework', function(){
	describe('1', function(){
		it('should equal 1', function(){
			var one = 1;
			one.should.equal(1);
			one.should.not.equal(2);
		})
	})
});
